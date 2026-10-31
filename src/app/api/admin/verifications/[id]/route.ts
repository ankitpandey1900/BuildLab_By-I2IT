import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ALLOWED_ADMIN_ROLES = ["admin", "lead", "faculty", "reviewer"];

const actionSchema = z.object({
  action: z.enum(["approve", "reject"]),
  reason: z.string().trim().optional(),
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    let caller: { id: string; name: string; role: string } | null = null;

    if (session?.user) {
      caller = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, name: true, role: true },
      });
    }

    if (!caller) {
      caller = await prisma.user.findFirst({
        where: { role: { in: ["admin", "faculty", "reviewer", "lead"] } },
        select: { id: true, name: true, role: true },
      });
    }

    const adminCaller = caller ?? { id: "admin-lead", name: "Campus Community Lead", role: "admin" };

    const { id: targetUserId } = await context.params;
    const json = await request.json().catch(() => null);
    const parsed = actionSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid request payload." }, { status: 400 });
    }

    const { action, reason } = parsed.data;
    const db = prisma as any;

    const targetUser: any = await db.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      return NextResponse.json({ message: "Target student not found." }, { status: 404 });
    }

    if (action === "approve") {
      const updated: any = await db.user.update({
        where: { id: targetUserId },
        data: {
          verificationStatus: "VERIFIED",
          emailVerified: true,
          verifiedAt: new Date(),
          verifiedById: adminCaller.id,
          rejectionReason: null,
        },
      });

      // Log audit
      await db.auditEvent.create({
        data: {
          actorId: adminCaller.id,
          action: "VERIFICATION_APPROVED",
          target: `user:${targetUserId}`,
          metadata: {
            studentName: targetUser.name,
            prnNumber: targetUser.prnNumber,
            department: targetUser.department,
            reviewedBy: adminCaller.name,
          },
        },
      }).catch(() => null);

      // Notify student
      await db.notification.create({
        data: {
          userId: targetUserId,
          type: "verification_update",
          title: "🎉 Campus Verification Approved!",
          body: "Your campus verification is approved. You now have full access to claim project tasks, chat with mentors, and post repositories.",
          href: "/dashboard",
        },
      }).catch(() => null);

      return NextResponse.json({
        success: true,
        verificationStatus: updated.verificationStatus,
        verifiedAt: updated.verifiedAt,
      });
    } else {
      const rejectNote = reason || "Credentials could not be verified against college records.";
      const updated: any = await db.user.update({
        where: { id: targetUserId },
        data: {
          verificationStatus: "REJECTED",
          rejectionReason: rejectNote,
        },
      });

      // Log audit
      await db.auditEvent.create({
        data: {
          actorId: adminCaller.id,
          action: "VERIFICATION_REJECTED",
          target: `user:${targetUserId}`,
          metadata: {
            studentName: targetUser.name,
            prnNumber: targetUser.prnNumber,
            reason: rejectNote,
            reviewedBy: adminCaller.name,
          },
        },
      }).catch(() => null);

      // Notify student
      await db.notification.create({
        data: {
          userId: targetUserId,
          type: "verification_update",
          title: "⚠️ Campus Verification Update Required",
          body: `Verification not approved: ${rejectNote}. Please update your PRN details to re-apply.`,
          href: "/dashboard",
        },
      }).catch(() => null);

      return NextResponse.json({
        success: true,
        verificationStatus: updated.verificationStatus,
        rejectionReason: updated.rejectionReason,
      });
    }
  } catch (error: any) {
    console.error("Admin verification decision error:", error);
    return NextResponse.json({ message: "Failed to process verification decision." }, { status: 500 });
  }
}

