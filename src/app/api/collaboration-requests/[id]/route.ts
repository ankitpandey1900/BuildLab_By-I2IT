import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const decisionSchema = z.object({ status: z.enum(["accepted", "declined", "changes_requested"]), note: z.string().trim().max(1000).optional() });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ message: "Sign in required." }, { status: 401 });
  const { id } = await params; const parsed = decisionSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ message: "Invalid decision." }, { status: 400 });
  const collaborationRequest = await prisma.collaborationRequest.findUnique({ where: { id }, include: { project: { include: { members: { where: { userId: session.user.id, role: "maintainer" } } } } } });
  if (!collaborationRequest) return NextResponse.json({ message: "Request not found." }, { status: 404 });
  const canDecide = collaborationRequest.project.ownerId === session.user.id || collaborationRequest.project.members.length > 0;
  if (!canDecide) return NextResponse.json({ message: "Only a project owner or maintainer can decide this request." }, { status: 403 });
  if (collaborationRequest.status !== "pending" && collaborationRequest.status !== "changes_requested") return NextResponse.json({ message: "This request already has a final decision." }, { status: 409 });
  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.collaborationRequest.update({ where: { id }, data: { status: parsed.data.status, activities: { create: { actorId: session.user.id, action: parsed.data.status, note: parsed.data.note } } }, include: { activities: { orderBy: { createdAt: "asc" } } } });
    if (parsed.data.status === "accepted") await tx.projectMember.upsert({ where: { projectId_userId: { projectId: collaborationRequest.projectId, userId: collaborationRequest.applicantId } }, create: { projectId: collaborationRequest.projectId, userId: collaborationRequest.applicantId }, update: {} });
    await tx.$executeRaw`INSERT INTO "Notification" ("id", "userId", "type", "title", "body", "href", "createdAt") VALUES (${crypto.randomUUID()}, ${collaborationRequest.applicantId}, 'collaboration_decision', 'Collaboration request updated', ${`Your request was ${parsed.data.status.replace("_", " ")}.`}, '/dashboard', NOW())`;
    await tx.auditEvent.create({
      data: {
        actorId: session.user.id,
        action: `collaboration.${parsed.data.status}`,
        target: id,
        metadata: { projectId: collaborationRequest.projectId, applicantId: collaborationRequest.applicantId },
      },
    });
    return result;
  });
  return NextResponse.json(updated);
}
