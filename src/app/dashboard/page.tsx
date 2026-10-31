import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { App } from "@/App";
import { CollaborationRequest, Project, StudentProfile } from "@/types";
import { prisma } from "@/lib/prisma";
import { parseList } from "@/lib/project-access";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const decodeList = (value?: string | null) => {
    try {
      return value ? JSON.parse(value) : [];
    } catch {
      return [];
    }
  };

  const db = prisma as any;

  // DIRECT ACCESS: If no session, automatically use the database dev user
  const activeUser = session?.user
    ? await prisma.user.findUnique({ where: { id: session.user.id } })
    : (await prisma.user.findFirst({ where: { email: { contains: "aarav" } } })) || (await prisma.user.findFirst());

  let profile: StudentProfile;
  let collaborationRequests: CollaborationRequest[] = [];
  let notifications: any[] = [];

  if (activeUser) {
    const dbUser = activeUser as any;

    const rawContributions = await db.verifiedContribution.findMany({
      where: { userId: dbUser.id },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const mappedContributions = (rawContributions as any[]).map((c: any) => ({
      id: c.id,
      type: c.type,
      title: c.title,
      repo: c.repo,
      verifiedByGitHub: Boolean(c.verifiedByGitHub),
      externalUrl: c.externalUrl ?? undefined,
      sha: c.sha ?? undefined,
      details: c.details ?? undefined,
      date: new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(c.createdAt)),
    }));

    profile = {
      id: dbUser.id,
      name: dbUser.name,
      username: dbUser.email.split("@")[0],
      email: dbUser.email,
      collegeVerified: dbUser.verificationStatus === "VERIFIED" || Boolean(dbUser.emailVerified),
      collegeOrgId: dbUser.branchYear ?? "",
      githubConnected: true,
      githubUsername: dbUser.email.split("@")[0],
      avatarUrl: dbUser.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(dbUser.name)}&background=222&color=fff`,
      bio: dbUser.bio ?? "",
      skills: decodeList(dbUser.skills),
      interests: decodeList(dbUser.interests),
      weeklyAvailabilityHours: dbUser.availability ?? 0,
      joinedDate: new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(dbUser.createdAt || new Date()),
      verifiedContributions: mappedContributions,
      role: dbUser.role || "student",
      verificationStatus: dbUser.verificationStatus || "UNVERIFIED",
      prnNumber: dbUser.prnNumber ?? undefined,
      rollNumber: dbUser.rollNumber ?? undefined,
      department: dbUser.department ?? undefined,
      academicYear: dbUser.academicYear ?? undefined,
      rejectionReason: dbUser.rejectionReason ?? undefined,
      verifiedAt: dbUser.verifiedAt ? dbUser.verifiedAt.toISOString() : undefined,
      isGuest: false,
    };

    const requests = await prisma.collaborationRequest.findMany({
      where: {
        OR: [
          { applicantId: dbUser.id },
          {
            project: {
              OR: [
                { ownerId: dbUser.id },
                { members: { some: { userId: dbUser.id, role: "maintainer" } } },
              ],
            },
          },
        ],
      },
      include: {
        project: { select: { id: true, name: true } },
        applicant: {
          select: { id: true, name: true, email: true, image: true, skills: true, emailVerified: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    collaborationRequests = requests.map((request: any) => ({
      id: request.id,
      projectId: request.projectId,
      projectName: request.project.name,
      role: request.role,
      message: request.message,
      status: request.status as CollaborationRequest["status"],
      submittedAt: request.createdAt.toLocaleDateString(),
      applicant: {
        id: request.applicant.id,
        name: request.applicant.name,
        username: request.applicant.email.split("@")[0],
        avatarUrl: request.applicant.image ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(request.applicant.name)}&background=222&color=fff`,
        skills: parseList(request.applicant.skills),
        collegeVerified: request.applicant.emailVerified,
      },
    }));

    const rawNotifications = await db.notification.findMany({
      where: { userId: dbUser.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    notifications = (rawNotifications as any[]).map((n: any) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      body: n.body,
      href: n.href,
      readAt: n.readAt ? (n.readAt instanceof Date ? n.readAt.toISOString() : n.readAt) : null,
      createdAt: n.createdAt instanceof Date ? n.createdAt.toISOString() : n.createdAt,
    }));
  } else {
    // Fallback developer profile if no users in database
    profile = {
      id: "dev-student-1",
      name: "Aarav Sharma",
      username: "aarav",
      email: "aarav.sharma@isquareit.edu.in",
      collegeVerified: true,
      collegeOrgId: "Computer Engineering · 2026",
      githubConnected: true,
      githubUsername: "aarav-sharma",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      bio: "Junior CS student building open-source tools for campus engineering.",
      skills: ["TypeScript", "React", "Next.js", "Docker"],
      interests: ["Open Source", "Distributed Systems"],
      weeklyAvailabilityHours: 8,
      joinedDate: "October 2026",
      verifiedContributions: [],
      role: "student",
      verificationStatus: "VERIFIED",
      prnNumber: "72234012A",
      rollNumber: "33104",
      department: "Computer Engineering",
      academicYear: "Third Year (TE)",
      isGuest: false,
    };
  }

  // Fetch all active campus projects
  const rawProjects = await db.project.findMany({
    where: {
      archivedAt: null,
    },
    include: {
      owner: { select: { id: true, name: true, image: true, branchYear: true, emailVerified: true } },
      members: { include: { user: { select: { id: true, name: true, image: true } } } },
      tasks: { orderBy: { createdAt: "desc" } },
      supportApplication: true,
      _count: { select: { members: true, verifiedContributions: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });

  const directory: Project[] = (rawProjects as any[]).map((project) => {
    const projectTasks = Array.isArray(project.tasks) ? project.tasks : [];
    const mappedTasks = projectTasks.map((t: any) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      difficulty: t.difficulty as "beginner" | "intermediate" | "advanced",
      status: t.status as "open" | "claimed" | "in_progress" | "resolved",
      linkedRole: t.role ?? undefined,
      tags: [],
      suggestedFiles: parseList(t.suggestedFiles),
    }));

    const roleNames = parseList(project.teamNeeds);
    const openRoles = roleNames.map((role: string) => ({
      role,
      count: 1,
      description: `Looking for a ${role}.`,
      problems: mappedTasks.filter((t: any) => !t.linkedRole || t.linkedRole.toLowerCase() === role.toLowerCase()),
    }));

    return {
      id: project.id,
      name: project.name,
      slug: project.slug,
      summary: project.summary,
      problemStatement: project.problemStatement,
      track: (project.supportApplication?.status === "approved" ? "community_supported" : "independent") as Project["track"],
      maturity: project.maturity as Project["maturity"],
      visibility: project.visibility as Project["visibility"],
      repoUrl: project.repositoryUrl ?? undefined,
      license: project.license ?? undefined,
      contributionGuide: project.contributionGuide ?? undefined,
      skills: parseList(project.skills),
      currentStack: parseList(project.skills),
      openRoles,
      tasks: mappedTasks,
      firstIssues: [],
      handoverFlagged: Boolean(project.handoverFlagged),
      readme: project.readme
        ? typeof project.readme === "string" && project.readme.startsWith("{")
          ? JSON.parse(project.readme)
          : { rawMarkdown: project.readme }
        : undefined,
      supportApplication: project.supportApplication
        ? {
            id: project.supportApplication.id,
            status: project.supportApplication.status as any,
            problem: project.supportApplication.problem,
            targetAudience: project.supportApplication.targetAudience,
            requestedSupport: decodeList(project.supportApplication.requestedSupport),
            risksAndMitigations: project.supportApplication.risksAndMitigations,
            nextMilestone: project.supportApplication.nextMilestone,
            submittedAt: new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(
              new Date(project.supportApplication.createdAt)
            ),
            reviewerNotes: project.supportApplication.reviewerNotes ?? undefined,
            reviewedBy: project.supportApplication.reviewedBy ?? undefined,
            decisionDate: project.supportApplication.decisionDate
              ? new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(
                  new Date(project.supportApplication.decisionDate)
                )
              : undefined,
          }
        : undefined,
      owner: {
        id: project.owner.id,
        name: project.owner.name,
        username: project.owner.emailVerified ? project.owner.name.toLowerCase().replace(/\s+/g, "-") : "member",
        collegeVerified: project.owner.emailVerified,
        avatarUrl:
          project.owner.image ??
          `https://ui-avatars.com/api/?name=${encodeURIComponent(project.owner.name)}&background=222&color=fff`,
        branchOrMajor: project.owner.branchYear || "I2IT student",
      },
      collaboratorsCount: (project._count?.members ?? 0) + 1,
      verifiedCommitsCount: project._count?.verifiedContributions ?? 0,
      lastActivity: project.updatedAt.toLocaleDateString(),
      createdAt: project.createdAt.toISOString().slice(0, 10),
      members: (project.members || []).map((m: any) => ({
        id: m.id,
        userId: m.userId,
        role: m.role,
        user: { id: m.user?.id, name: m.user?.name, avatarUrl: m.user?.image ?? undefined },
      })),
    };
  });

  return (
    <App
      initialUser={profile}
      initialProjects={directory}
      initialRequests={collaborationRequests}
      initialNotifications={notifications}
    />
  );
}
