import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageProject } from "@/lib/project-access";

const createTaskSchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().max(2000).default(""),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
  role: z.string().trim().max(80).optional(),
  suggestedFiles: z.array(z.string().trim().min(1).max(100)).max(10).default([]),
});

async function getProjectWithAuth(projectId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: NextResponse.json({ message: "Sign in required." }, { status: 401 }) };
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { members: { where: { userId: session.user.id } } },
  });
  if (!project) return { error: NextResponse.json({ message: "Project not found." }, { status: 404 }) };
  const user = { id: session.user.id, role: session.user.role || "student" };
  const isMaintainer = project.members.some((m) => m.role === "maintainer");
  const isAuthorized = canManageProject(user, project) || isMaintainer;
  return { session, user, project, isAuthorized };
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = prisma as any;
  const tasks = await db.projectTask.findMany({
    where: { projectId: id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(tasks);
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authRes = await getProjectWithAuth(id);
  if (authRes.error) return authRes.error;
  if (!authRes.isAuthorized) {
    return NextResponse.json({ message: "Only project maintainers or owners can add tasks." }, { status: 403 });
  }

  const parsed = createTaskSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid task details." }, { status: 400 });
  }

  const db = prisma as any;
  const task = await db.projectTask.create({
    data: {
      projectId: id,
      title: parsed.data.title,
      description: parsed.data.description,
      difficulty: parsed.data.difficulty,
      role: parsed.data.role || null,
      suggestedFiles: JSON.stringify(parsed.data.suggestedFiles),
    },
  });

  await prisma.auditEvent.create({
    data: {
      actorId: authRes.session.user.id,
      action: "project.task_created",
      target: task.id,
      metadata: { projectId: id, title: task.title },
    },
  });

  return NextResponse.json(task, { status: 201 });
}

