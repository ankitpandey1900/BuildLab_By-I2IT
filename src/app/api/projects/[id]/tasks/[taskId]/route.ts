import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageProject } from "@/lib/project-access";

const updateTaskSchema = z.object({
  title: z.string().trim().min(3).max(120).optional(),
  description: z.string().trim().max(2000).optional(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  status: z.enum(["open", "in_progress", "resolved"]).optional(),
  role: z.string().trim().max(80).optional(),
  suggestedFiles: z.array(z.string().trim().min(1).max(100)).max(10).optional(),
});

async function getProjectTaskAuth(projectId: string, taskId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: NextResponse.json({ message: "Sign in required." }, { status: 401 }) };
  const db = prisma as any;
  const project = await db.project.findUnique({
    where: { id: projectId },
    include: { members: { where: { userId: session.user.id } } },
  });
  if (!project) return { error: NextResponse.json({ message: "Project not found." }, { status: 404 }) };
  const task = await db.projectTask.findUnique({ where: { id: taskId } });
  if (!task || task.projectId !== projectId) {
    return { error: NextResponse.json({ message: "Task not found." }, { status: 404 }) };
  }
  const user = { id: session.user.id, role: session.user.role || "student" };
  const isMaintainer = project.members.some((m: any) => m.role === "maintainer");
  const isAuthorized = canManageProject(user, project) || isMaintainer;
  return { session, user, project, task, isAuthorized };
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  const { id, taskId } = await params;
  const authRes = await getProjectTaskAuth(id, taskId);
  if (authRes.error) return authRes.error;
  if (!authRes.isAuthorized) {
    return NextResponse.json({ message: "Only maintainers or project owners can update tasks." }, { status: 403 });
  }

  const parsed = updateTaskSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid task updates." }, { status: 400 });
  }

  const db = prisma as any;
  const updated = await db.projectTask.update({
    where: { id: taskId },
    data: {
      ...parsed.data,
      suggestedFiles: parsed.data.suggestedFiles ? JSON.stringify(parsed.data.suggestedFiles) : undefined,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  const { id, taskId } = await params;
  const authRes = await getProjectTaskAuth(id, taskId);
  if (authRes.error) return authRes.error;
  if (!authRes.isAuthorized) {
    return NextResponse.json({ message: "Only maintainers or project owners can delete tasks." }, { status: 403 });
  }

  const db = prisma as any;
  await db.projectTask.delete({ where: { id: taskId } });
  return NextResponse.json({ deleted: true });
}

