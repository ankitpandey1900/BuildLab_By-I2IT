import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageProject } from "@/lib/project-access";
import type { Project, ProjectMember } from "@prisma/client";

const assignSchema = z.object({
  assigneeId: z.string().min(1, "assigneeId is required"),
});

/**
 * Verify whether the caller has permissions to assign tasks in this project.
 * Only the project owner, project maintainers, or platform administrators are authorized.
 */
function isAuthorizedToAssign(
  userId: string,
  userRole: string,
  project: Project & { members: ProjectMember[] }
): boolean {
  const isOwner = project.ownerId === userId;
  const isMaintainer = project.members.some(
    (m) => m.userId === userId && m.role.toLowerCase() === "maintainer"
  );
  return isOwner || isMaintainer || canManageProject({ id: userId, role: userRole }, project);
}

/**
 * Validate that the requested assignee is an accepted project member.
 * Returns true if the user is the project owner or has an accepted ProjectMember record.
 */
async function validateProjectAssignee(
  projectId: string,
  assigneeId: string,
  projectOwnerId: string
): Promise<{ isAccepted: boolean; member: ProjectMember | null }> {
  const assigneeMember = await prisma.projectMember.findFirst({
    where: {
      projectId,
      userId: assigneeId,
    },
  });

  const isOwner = projectOwnerId === assigneeId;
  const isPendingOrRejected =
    Boolean(assigneeMember) &&
    (assigneeMember!.role.toLowerCase() === "pending" ||
      assigneeMember!.role.toLowerCase() === "rejected" ||
      (assigneeMember as unknown as { status?: string }).status === "pending" ||
      (assigneeMember as unknown as { status?: string }).status === "rejected");

  const isAccepted = isOwner || (Boolean(assigneeMember) && !isPendingOrRejected);

  return { isAccepted, member: assigneeMember };
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  const { id: projectId, taskId } = await params;

  // 1. Request Validation
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request payload." }, { status: 400 });
  }

  const parsed = assignSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid request payload." }, { status: 400 });
  }
  const { assigneeId } = parsed.data;

  // 2. Authentication
  let reqHeaders: Headers;
  try {
    reqHeaders = await headers();
  } catch {
    reqHeaders = new Headers(request.headers);
  }
  const session = await auth.api.getSession({ headers: reqHeaders });
  if (!session) {
    return NextResponse.json({ message: "Sign in required." }, { status: 401 });
  }

  // 3. Project and Task Lookup & Validation
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { members: true },
  });
  if (!project) {
    return NextResponse.json({ message: "Project not found." }, { status: 404 });
  }

  const task = await prisma.projectTask.findUnique({
    where: { id: taskId },
  });
  if (!task || task.projectId !== projectId) {
    return NextResponse.json({ message: "Task not found." }, { status: 404 });
  }

  // 4. Authorization Check
  const userRole = session.user.role || "student";
  if (!isAuthorizedToAssign(session.user.id, userRole, project)) {
    return NextResponse.json(
      { message: "Only maintainers or project owners can assign tasks." },
      { status: 403 }
    );
  }

  // 5. Validate Assignee Membership
  const { isAccepted } = await validateProjectAssignee(projectId, assigneeId, project.ownerId);
  if (!isAccepted) {
    return NextResponse.json(
      { message: "Assignee must be an accepted project member." },
      { status: 400 }
    );
  }

  // 6. Update Task and Create Notification in Database Transaction
  try {
    const updatedTask = await prisma.$transaction(async (tx) => {
      const updated = await tx.projectTask.update({
        where: { id: taskId },
        data: {
          status: "in_progress",
          assigneeId,
        },
      });

      // Avoid creating duplicate notifications through accidental repeated operations
      if (task.assigneeId !== assigneeId) {
        await tx.notification.create({
          data: {
            userId: assigneeId,
            type: "task_assigned",
            title: "Task Assigned",
            body: `You have been assigned to task: ${task.title} in ${project.name}`,
            href: "/dashboard",
          },
        });
      }

      await tx.auditEvent.create({
        data: {
          actorId: session.user.id,
          action: "project.task_assigned",
          target: taskId,
          metadata: { projectId, assigneeId, taskTitle: task.title },
        },
      });

      return updated;
    });

    // 7. Return Successful Response
    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("Failed to assign project task:", error);
    return NextResponse.json(
      { message: "Failed to assign task." },
      { status: 500 }
    );
  }
}
