import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseList } from "@/lib/project-access";

export const dynamic = "force-dynamic";

export const applyRoleSchema = z.object({
  role: z
    .string()
    .trim()
    .min(2, "Role must be at least 2 characters")
    .max(80, "Role must not exceed 80 characters"),
  message: z
    .string()
    .trim()
    .min(20, "Please provide a detailed pitch (at least 20 characters)")
    .max(2000, "Message must not exceed 2000 characters"),
  issueUrl: z
    .string()
    .url("Invalid issue URL")
    .optional()
    .or(z.literal(""))
    .nullable(),
  targetIssueTitle: z.string().trim().max(200).optional().nullable(),
  weeklyHours: z.coerce.number().min(1).max(168).optional().nullable(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    if (!projectId || typeof projectId !== "string") {
      return NextResponse.json({ message: "Invalid project ID." }, { status: 400 });
    }

    let reqHeaders: Headers;
    try {
      reqHeaders = await headers();
    } catch {
      reqHeaders = new Headers(request.headers);
    }
    const session = await auth.api.getSession({ headers: reqHeaders });

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        archivedAt: null,
      },
      select: {
        id: true,
        name: true,
        ownerId: true,
        visibility: true,
        teamNeeds: true,
        tasks: {
          select: {
            id: true,
            title: true,
            role: true,
            status: true,
            difficulty: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { message: "Project not found or is no longer active." },
        { status: 404 }
      );
    }

    const configuredRoles = parseList(project.teamNeeds);

    let myApplications: any[] = [];
    if (session?.user?.id) {
      myApplications = await prisma.collaborationRequest.findMany({
        where: {
          projectId,
          applicantId: session.user.id,
        },
        orderBy: { createdAt: "desc" },
        include: {
          activities: {
            orderBy: { createdAt: "asc" },
          },
        },
      });
    }

    return NextResponse.json({
      projectId: project.id,
      projectName: project.name,
      openRoles: configuredRoles,
      tasks: project.tasks,
      myApplications,
    });
  } catch (error) {
    console.error("GET /api/projects/[id]/roles/apply error:", error);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    if (!projectId || typeof projectId !== "string") {
      return NextResponse.json({ message: "Invalid project ID." }, { status: 400 });
    }

    // 1. Request body parsing
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ message: "Malformed JSON body." }, { status: 400 });
    }

    // 2. Schema validation
    const parsed = applyRoleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          message: parsed.error.issues[0]?.message || "Invalid payload.",
          errors: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    // 3. Anti-spam heuristic: ensure pitch contains enough meaningful words
    const words = parsed.data.message.split(/\s+/).filter(Boolean);
    if (words.length < 4) {
      return NextResponse.json(
        {
          message:
            "Please provide a more descriptive collaboration message explaining your interest and skills.",
        },
        { status: 400 }
      );
    }

    // 4. Authentication verification
    let reqHeaders: Headers;
    try {
      reqHeaders = await headers();
    } catch {
      reqHeaders = new Headers(request.headers);
    }
    const session = await auth.api.getSession({ headers: reqHeaders });
    const applicantId = session?.user?.id;
    if (!applicantId) {
      return NextResponse.json({ message: "Sign in required." }, { status: 401 });
    }

    // 5. Rate limiting: max 10 role applications per 10 minutes per applicant
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const recentRequestsCount = await prisma.collaborationRequest.count({
      where: {
        applicantId,
        createdAt: { gte: tenMinutesAgo },
      },
    });

    if (recentRequestsCount >= 10) {
      return NextResponse.json(
        {
          message:
            "You have submitted multiple requests recently. Please wait a few minutes before applying again.",
        },
        { status: 429 }
      );
    }

    // 6. Project existence & active state verification
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        archivedAt: null,
      },
      select: {
        id: true,
        name: true,
        ownerId: true,
        visibility: true,
        teamNeeds: true,
      },
    });

    if (!project) {
      return NextResponse.json(
        { message: "Project not found or is no longer active." },
        { status: 404 }
      );
    }

    // Handle private visibility restriction
    if (project.visibility === "private" && project.ownerId !== applicantId) {
      const isMember = await prisma.projectMember.findFirst({
        where: { projectId: project.id, userId: applicantId },
      });
      if (!isMember) {
        return NextResponse.json(
          { message: "Project not found or is no longer active." },
          { status: 404 }
        );
      }
    }

    // 7. Prevent self-application (project owner cannot apply for roles on their own project)
    if (project.ownerId === applicantId) {
      return NextResponse.json(
        { message: "You cannot apply to your own project." },
        { status: 400 }
      );
    }

    // 8. Prevent existing accepted project members from reapplying
    const existingMember = await prisma.projectMember.findFirst({
      where: {
        projectId: project.id,
        userId: applicantId,
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { message: "You are already a member of this project." },
        { status: 400 }
      );
    }

    // 9. Prevent duplicate pending applications for the same role
    const existingPending = await prisma.collaborationRequest.findFirst({
      where: {
        projectId: project.id,
        applicantId,
        role: parsed.data.role,
        status: "pending",
      },
    });

    if (existingPending) {
      return NextResponse.json(
        { message: "You already have a pending application for this role." },
        { status: 409 }
      );
    }

    // 10. Atomic database mutations via transaction
    const collaborationRequest = await prisma.$transaction(async (tx) => {
      // 10a. Create CollaborationRequest with initial activity log
      const created = await tx.collaborationRequest.create({
        data: {
          projectId: project.id,
          applicantId,
          role: parsed.data.role,
          message: parsed.data.message,
          issueUrl: parsed.data.issueUrl || null,
          status: "pending",
          activities: {
            create: {
              actorId: applicantId,
              action: "submitted",
              note: parsed.data.targetIssueTitle
                ? `Applied for role "${parsed.data.role}" on task "${parsed.data.targetIssueTitle}".`
                : `Applied for role "${parsed.data.role}".`,
            },
          },
        },
        include: {
          activities: true,
          project: {
            select: {
              id: true,
              name: true,
              ownerId: true,
            },
          },
          applicant: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              skills: true,
            },
          },
        },
      });

      // 10b. Create in-app notification for the project owner
      const notificationTitle = "New Role Application";
      const notificationBody = `A student applied for the "${parsed.data.role}" role on ${project.name}.`;
      const notificationHref = "/dashboard";

      try {
        await tx.$executeRaw`
          INSERT INTO "Notification" ("id", "userId", "type", "title", "body", "href", "createdAt")
          VALUES (
            ${crypto.randomUUID()},
            ${project.ownerId},
            'collaboration_request',
            ${notificationTitle},
            ${notificationBody},
            ${notificationHref},
            NOW()
          )
        `;
      } catch {
        // Fallback for environments / mocks where $executeRaw is unavailable
        if (typeof (tx as any).notification?.create === "function") {
          await (tx as any).notification.create({
            data: {
              userId: project.ownerId,
              type: "collaboration_request",
              title: notificationTitle,
              body: notificationBody,
              href: notificationHref,
            },
          });
        }
      }

      // 10c. Record immutable AuditEvent
      await tx.auditEvent.create({
        data: {
          actorId: applicantId,
          action: "collaboration.requested",
          target: created.id,
          metadata: {
            projectId: project.id,
            projectName: project.name,
            role: parsed.data.role,
            targetIssueTitle: parsed.data.targetIssueTitle || null,
            weeklyHours: parsed.data.weeklyHours || null,
          },
        },
      });

      return created;
    });

    return NextResponse.json(
      {
        success: true,
        ...collaborationRequest,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/projects/[id]/roles/apply error:", error);
    return NextResponse.json(
      { message: "Internal server error occurred while applying for role." },
      { status: 500 }
    );
  }
}
