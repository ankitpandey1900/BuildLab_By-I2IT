import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminCaller } from "@/lib/admin-caller";
import { canChangeUserRole } from "@/lib/permissions";
import { checkRateLimit } from "@/lib/rate-limit";

const roleSchema = z.object({
  role: z.enum([
    "student",
    "faculty",
    "reviewer",
    "lead",
    "admin",
  ]),
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Step 1: Admin authentication & role-change authorization policy check
    const admin = await getAdminCaller();
    if (!admin || !canChangeUserRole(admin.role)) {
      return NextResponse.json(
        {
          message: "Forbidden. Admin privileges required.",
          error: "Forbidden. Admin privileges required.",
        },
        { status: 403 }
      );
    }

    // Request payload validation
    const json = await request.json().catch(() => null);
    const parsed = roleSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Invalid request payload.",
          error: "Invalid request payload.",
        },
        { status: 400 }
      );
    }

    const { id: targetUserId } = await context.params;

    // Step 2: Prevent self-demotion
    if (targetUserId === admin.id) {
      return NextResponse.json(
        {
          message: "You cannot change your own admin role.",
          error: "You cannot change your own admin role.",
        },
        { status: 400 }
      );
    }

    // Step 2.5: Restrict repeated role-change requests using rate-limit
    const targetRateLimit = checkRateLimit(`role-change:target:${targetUserId}`, 5, 60 * 1000);
    if (!targetRateLimit.success) {
      return NextResponse.json(
        {
          message: `Too many role-change requests for this user. Please wait ${targetRateLimit.resetSeconds}s before retrying.`,
          error: `Too many role-change requests for this user. Please wait ${targetRateLimit.resetSeconds}s before retrying.`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(targetRateLimit.resetSeconds),
          },
        }
      );
    }

    const adminRateLimit = checkRateLimit(`role-change:admin:${admin.id}`, 20, 60 * 1000);
    if (!adminRateLimit.success) {
      return NextResponse.json(
        {
          message: `Too many role-change requests. Please wait ${adminRateLimit.resetSeconds}s before retrying.`,
          error: `Too many role-change requests. Please wait ${adminRateLimit.resetSeconds}s before retrying.`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(adminRateLimit.resetSeconds),
          },
        }
      );
    }

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
      return NextResponse.json(
        {
          message: "Too many role-change updates for this user. Please wait a minute before trying again.",
          error: "Too many role-change updates for this user. Please wait a minute before trying again.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": "60",
          },
        }
      );
    }

    const newRole = parsed.data.role;

    // Execute target lookup, validations, update, audit event, and notification within an atomic transaction
    const result = await prisma.$transaction(async (tx) => {
      // Step 3: Verify target user inside the transaction
      const targetUser = await tx.user.findUnique({
        where: { id: targetUserId },
        select: { id: true, role: true, name: true },
      });

      if (!targetUser) {
        return {
          status: 404,
          error: "Target user not found.",
        };
      }

      // 1) Prevent unnecessary role updates (no DB update, audit event, or notification)
      if (targetUser.role === newRole) {
        return {
          status: 200,
          data: {
            success: true,
            updatedRole: targetUser.role,
          },
        };
      }

      // 2) Protect the last admin account from demotion
      if (targetUser.role === "admin" && newRole !== "admin") {
        const adminCount = await tx.user.count({
          where: { role: "admin" },
        });
        if (adminCount <= 1) {
          return {
            status: 400,
            error: "Cannot demote the last remaining admin account.",
          };
        }
      }

      const previousRole = targetUser.role;

      // Step 4: Update role
      await tx.user.update({
        where: { id: targetUserId },
        data: { role: newRole },
      });

      // Step 5: Create audit record
      await tx.auditEvent.create({
        data: {
          actorId: admin.id,
          action: "ROLE_CHANGED",
          target: targetUserId,
          metadata: {
            previousRole,
            newRole,
            adminName: admin.name,
          },
        },
      });

      // Step 6: Create notification
      await tx.notification.create({
        data: {
          userId: targetUserId,
          type: "role_updated",
          title: "Platform Role Updated",
          body: `Your role has been updated to ${newRole}. You now have updated platform privileges.`,
          href: "/dashboard",
        },
      });

      return {
        status: 200,
        data: {
          success: true,
          updatedRole: newRole,
        },
      };
    });

    if (result.status !== 200) {
      return NextResponse.json(
        {
          message: result.error,
          error: result.error,
        },
        { status: result.status }
      );
    }

    // Step 7: Return response
    return NextResponse.json(result.data, { status: 200 });
  } catch (error) {
    console.error("Role promotion error:", error);
    return NextResponse.json(
      {
        message: "Failed to update user role.",
        error: "Failed to update user role.",
      },
      { status: 500 }
    );
  }
}

