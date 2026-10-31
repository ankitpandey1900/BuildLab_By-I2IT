import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const db = prisma as any;

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ message: "Sign in required." }, { status: 401 });

  const { id } = await params;

  const project = await db.project.findUnique({
    where: { id },
  });

  if (!project) {
    return NextResponse.json({ message: "Project not found." }, { status: 404 });
  }

  const updated = await db.project.update({
    where: { id },
    data: { handoverFlagged: true },
  });

  // Notify project owner
  if (project.ownerId !== session.user.id) {
    await db.notification.create({
      data: {
        userId: project.ownerId,
        type: "project_handover_flagged",
        title: "Maintainer handover requested",
        body: `${session.user.name} flagged "${project.name}" for maintainer handover or transition assistance.`,
        href: "/dashboard",
      },
    });
  }

  // Log audit event
  await db.auditEvent.create({
    data: {
      actorId: session.user.id,
      action: "project.handover_flagged",
      target: id,
      metadata: { projectName: project.name },
    },
  });

  return NextResponse.json({ success: true, project: updated });
}
