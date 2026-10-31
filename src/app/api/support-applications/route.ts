import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const db = prisma as any;

const submitAppSchema = z.object({
  projectId: z.string().min(1),
  problem: z.string().trim().max(2000).optional(),
  targetAudience: z.string().trim().max(500).optional(),
  requestedSupport: z.array(z.string().trim()).optional(),
  risksAndMitigations: z.string().trim().max(2000).optional(),
  nextMilestone: z.string().trim().max(500).optional(),
});

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ message: "Sign in required." }, { status: 401 });

  const applications = await db.supportApplication.findMany({
    include: {
      project: {
        select: {
          id: true,
          name: true,
          slug: true,
          ownerId: true,
          repositoryUrl: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(applications);
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ message: "Sign in required." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = submitAppSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message || "Invalid application data." },
      { status: 400 }
    );
  }

  const { projectId, problem, targetAudience, requestedSupport, risksAndMitigations, nextMilestone } = parsed.data;

  const project = await db.project.findUnique({
    where: { id: projectId },
    include: { members: true },
  });

  if (!project) {
    return NextResponse.json({ message: "Project not found." }, { status: 404 });
  }

  const isOwnerOrMember =
    project.ownerId === session.user.id ||
    project.members.some((m: any) => m.userId === session.user.id);

  if (!isOwnerOrMember) {
    return NextResponse.json(
      { message: "Only project maintainers can apply for community support." },
      { status: 403 }
    );
  }

  const application = await db.supportApplication.upsert({
    where: { projectId },
    update: {
      status: "submitted",
      problem: problem ?? project.problemStatement,
      targetAudience: targetAudience ?? "Campus Engineering Community",
      requestedSupport: requestedSupport ? JSON.stringify(requestedSupport) : JSON.stringify(["College GitHub Org Admission", "Mentorship", "Testing Hardware"]),
      risksAndMitigations: risksAndMitigations ?? "Regular milestone check-ins with college community leads.",
      nextMilestone: nextMilestone ?? "Deploy live prototype on college staging server.",
      updatedAt: new Date(),
    },
    create: {
      projectId,
      status: "submitted",
      problem: problem ?? project.problemStatement,
      targetAudience: targetAudience ?? "Campus Engineering Community",
      requestedSupport: requestedSupport ? JSON.stringify(requestedSupport) : JSON.stringify(["College GitHub Org Admission", "Mentorship", "Testing Hardware"]),
      risksAndMitigations: risksAndMitigations ?? "Regular milestone check-ins with college community leads.",
      nextMilestone: nextMilestone ?? "Deploy live prototype on college staging server.",
    },
  });

  await db.auditEvent.create({
    data: {
      actorId: session.user.id,
      action: "support_application.submitted",
      target: application.id,
      metadata: { projectId, projectName: project.name },
    },
  });

  return NextResponse.json(application);
}
