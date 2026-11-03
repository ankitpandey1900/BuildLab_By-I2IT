import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminCaller } from "@/lib/admin-caller";

const batchSchema = z.object({
  studentIds: z.array(z.string()).min(1),
  action: z.enum(["approve", "reject"]),
  reason: z.string().trim().optional(),
});

export async function POST(request: Request) {
  try {
    const adminCaller = await getAdminCaller();
    if (!adminCaller) {
      return NextResponse.json(
        { message: "Forbidden. Admin or reviewer privileges required." },
        { status: 403 }
      );
    }

    const json = await request.json().catch(() => null);
    const parsed = batchSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid batch request payload." }, { status: 400 });
    }

    const { studentIds, action, reason } = parsed.data;
    const db = prisma as any;

    if (action === "approve") {
      const updated = await db.user.updateMany({
        where: { id: { in: studentIds } },
        data: {
          verificationStatus: "VERIFIED",
          emailVerified: true,
          verifiedAt: new Date(),
          verifiedById: adminCaller.id,
          rejectionReason: null,
        },
      });

      // Audit and notifications
      const notifications = studentIds.map((id: string) => ({
        userId: id,
        type: "verification_update",
        title: "🎉 Campus Verification Approved!",
        body: "Your campus verification is approved. You now have full access to claim project tasks and collaborate on BuildLab.",
        href: "/dashboard",
      }));

      await db.notification.createMany({
        data: notifications,
      }).catch(() => null);

      await db.auditEvent.create({
        data: {
          actorId: adminCaller.id,
          action: "BATCH_VERIFICATION_APPROVED",
          target: `users:${studentIds.length}`,
          metadata: {
            studentCount: studentIds.length,
            studentIds,
            reviewedBy: adminCaller.name,
          },
        },
      }).catch(() => null);

      return NextResponse.json({
        success: true,
        count: updated.count,
        action: "approve",
      });
    } else {
      const rejectNote = reason || "Credentials could not be verified against college records.";
      const updated = await db.user.updateMany({
        where: { id: { in: studentIds } },
        data: {
          verificationStatus: "REJECTED",
          rejectionReason: rejectNote,
        },
      });

      const notifications = studentIds.map((id: string) => ({
        userId: id,
        type: "verification_update",
        title: "⚠️ Campus Verification Update Required",
        body: `Verification not approved: ${rejectNote}. Please update your PRN details to re-apply.`,
        href: "/dashboard",
      }));

      await db.notification.createMany({
        data: notifications,
      }).catch(() => null);

      await db.auditEvent.create({
        data: {
          actorId: adminCaller.id,
          action: "BATCH_VERIFICATION_REJECTED",
          target: `users:${studentIds.length}`,
          metadata: {
            studentCount: studentIds.length,
            studentIds,
            reason: rejectNote,
            reviewedBy: adminCaller.name,
          },
        },
      }).catch(() => null);

      return NextResponse.json({
        success: true,
        count: updated.count,
        action: "reject",
      });
    }
  } catch (error: any) {
    console.error("Batch admin verification error:", error);
    return NextResponse.json({ message: "Failed to process batch verification." }, { status: 500 });
  }
}
