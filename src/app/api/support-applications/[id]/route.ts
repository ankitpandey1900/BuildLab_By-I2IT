import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const db = prisma as any;

const decisionSchema = z.object({
  decision: z.enum(["approved", "changes_requested", "declined"]),
  notes: z.string().trim().max(2000).optional(),
  reviewedBy: z.string().trim().max(100).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ message: "Sign in required." }, { status: 401 });

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = decisionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message || "Invalid decision payload." },
      { status: 400 }
    );
  }

  const { decision, notes, reviewedBy } = parsed.data;

  // Look up application by id or by projectId
  let application = await db.supportApplication.findUnique({
    where: { id },
    include: { project: true },
  });

  if (!application) {
    application = await db.supportApplication.findFirst({
      where: { projectId: id },
      include: { project: true },
    });
  }

  if (!application) {
    return NextResponse.json({ message: "Application not found." }, { status: 404 });
  }

  const now = new Date();
  const reviewerName = reviewedBy || session.user.name || "Review Committee";

  const updatedApplication = await db.$transaction(async (tx: any) => {
    const updated = await tx.supportApplication.update({
      where: { id: application.id },
      data: {
        status: decision,
        reviewerNotes: notes || `Application ${decision.replace("_", " ")}.`,
        reviewedBy: reviewerName,
        decisionDate: now,
        updatedAt: now,
      },
    });

    if (decision === "approved") {
      await tx.project.update({
        where: { id: application.projectId },
        data: {
          maturity: "active",
        },
      });
    }

    // Notify project owner
    await tx.notification.create({
      data: {
        userId: application.project.ownerId,
        type: "support_decision",
        title: `Community Support Decision: ${decision.replace("_", " ").toUpperCase()}`,
        body: notes
          ? `Your application for "${application.project.name}" was ${decision.replace("_", " ")}: ${notes}`
          : `Your application for "${application.project.name}" was ${decision.replace("_", " ")}.`,
        href: "/dashboard",
      },
    });

    // Audit log
    await tx.auditEvent.create({
      data: {
        actorId: session.user.id,
        action: `support_application.${decision}`,
        target: application.id,
        metadata: {
          projectId: application.projectId,
          decision,
          notes,
          reviewer: reviewerName,
        },
      },
    });

    return updated;
  });

  return NextResponse.json(updatedApplication);
}
