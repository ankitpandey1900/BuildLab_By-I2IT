import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminCaller } from "@/lib/admin-caller";
import { canChangeUserRole } from "@/lib/permissions";
import { assertRateLimit } from "@/lib/rate-limit";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  RateLimitError,
  handleApiError,
} from "@/lib/errors";

const roleSchema = z.object({
  role: z.enum([
    "student",
    "faculty",
    "reviewer",
    "lead",
    "admin",
  ]),
  reason: z.string().trim().max(500).optional(),
});

const ROLE_RANKS: Record<string, number> = {
  student: 1,
  lead: 2,
  reviewer: 3,
  faculty: 4,
  admin: 5,
};

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Step 1: Admin authentication & role-change authorization policy check
    const admin = await getAdminCaller();
    if (!admin || !canChangeUserRole(admin.role)) {
      throw new ForbiddenError("Forbidden. Admin privileges required.");
    }

    // Request payload validation
    const json = await request.json().catch(() => null);
    const parsed = roleSchema.safeParse(json);
    if (!parsed.success) {
      throw new BadRequestError("Invalid request payload.", parsed.error.issues);
    }

    const { id: rawTargetId } = await context.params;
    const targetUserId = rawTargetId?.trim();
    if (!targetUserId) {
      throw new BadRequestError("Invalid user ID parameter.");
    }

    // Step 2: Prevent self-demotion
    if (targetUserId === admin.id) {
      throw new BadRequestError("You cannot change your own admin role.");
    }

    // Step 2.5: Restrict repeated role-change requests using custom rate-limit assertion
    assertRateLimit(
      `role-change:target:${targetUserId}`,
      5,
      60 * 1000,
      "Too many role-change requests for this user. Please wait before retrying."
    );

    assertRateLimit(
      `role-change:admin:${admin.id}`,
      20,
      60 * 1000,
      "Too many role-change requests. Please wait before retrying."
    );

    // Persistent rate-limit check via AuditEvent to restrict repeated updates within 1 minute
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const recentDbChanges = await prisma.auditEvent.count({
      where: {
        action: "ROLE_CHANGED",
        target: targetUserId,
        createdAt: { gte: oneMinuteAgo },
      },
    });

    if (recentDbChanges >= 5) {
      throw new RateLimitError(
        "Too many role-change updates for this user. Please wait a minute before trying again.",
        60
      );
    }

    const { role: newRole, reason } = parsed.data;

    // Execute target lookup, validations, update, audit event, notification, and session revocation within an atomic transaction
    const updated = await prisma.$transaction(async (tx) => {
      // Step 3: Verify target user inside the transaction
      const targetUser = await tx.user.findUnique({
        where: { id: targetUserId },
        select: {
          id: true,
          role: true,
          name: true,
          email: true,
          verificationStatus: true,
        },
      });

      if (!targetUser) {
        throw new NotFoundError("Target user not found.");
      }

      // 1) Prevent unnecessary role updates (no DB update, audit event, or notification)
      if (targetUser.role === newRole) {
        return {
          success: true,
          updatedRole: targetUser.role,
        };
      }

      // 2) Verification status pre-condition: students must be verified to be elevated
      if (
        targetUser.role === "student" &&
        newRole !== "student" &&
        targetUser.verificationStatus !== "VERIFIED"
      ) {
        throw new BadRequestError(
          "Cannot promote an unverified student. The user must complete campus verification first."
        );
      }

      // 3) Protect the last admin account from demotion
      if (targetUser.role === "admin" && newRole !== "admin") {
        const adminCount = await tx.user.count({
          where: { role: "admin" },
        });
        if (adminCount <= 1) {
          throw new BadRequestError("Cannot demote the last remaining admin account.");
        }
      }

      const previousRole = targetUser.role;

      // Step 4: Update role
      await tx.user.update({
        where: { id: targetUserId },
        data: { role: newRole },
      });

      // Revoke active sessions to immediately enforce new role permissions
      await tx.session.deleteMany({
        where: { userId: targetUserId },
      });

      // Step 5: Create audit record with snapshot details and optional reason
      await tx.auditEvent.create({
        data: {
          actorId: admin.id,
          action: "ROLE_CHANGED",
          target: targetUserId,
          metadata: {
            previousRole,
            newRole,
            adminName: admin.name,
            adminId: admin.id,
            targetUserName: targetUser.name,
            targetUserEmail: targetUser.email,
            ...(reason ? { reason } : {}),
          },
        },
      });

      // Step 6: Create contextual notification (promotion vs demotion/update)
      const isPromotion = (ROLE_RANKS[newRole] ?? 0) > (ROLE_RANKS[previousRole] ?? 0);
      const notificationTitle = isPromotion
        ? "🎉 Platform Role Elevated"
        : "ℹ️ Platform Role Updated";
      const notificationBody = isPromotion
        ? `Congratulations! Your role has been elevated to ${newRole}. You now have updated platform privileges.`
        : `Your platform role has been updated to ${newRole}.`;

      await tx.notification.create({
        data: {
          userId: targetUserId,
          type: "role_updated",
          title: notificationTitle,
          body: notificationBody,
          href: "/dashboard",
        },
      });

      return {
        success: true,
        updatedRole: newRole,
      };
    });

    // Step 7: Return response
    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

