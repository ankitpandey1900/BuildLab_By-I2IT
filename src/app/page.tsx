import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LandingPage } from "@/components/LandingPage";
import { Project } from "@/types";
import { parseList } from "@/lib/project-access";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await auth.api.getSession({ headers: await headers() });

  const db = prisma as any;
  const rawProjects = await db.project.findMany({
    where: { 
      archivedAt: null, 
      visibility: { in: ["college", "public"] } 
    },
    include: {
      owner: { select: { id: true, name: true, image: true, branchYear: true, emailVerified: true } },
      members: { include: { user: { select: { id: true, name: true, image: true } } } },
      tasks: { orderBy: { createdAt: "desc" } },
      _count: { select: { members: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 12,
  });

  const directory: Project[] = (rawProjects as any[]).map((project) => {
    const projectTasks = Array.isArray(project.tasks) ? project.tasks : [];
    const mappedTasks = projectTasks.map((t: any) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      difficulty: t.difficulty as 'beginner' | 'intermediate' | 'advanced',
      status: t.status as 'open' | 'claimed' | 'in_progress' | 'resolved',
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
      track: project.track === "community_supported" ? "community_supported" : "independent",
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
      owner: {
        id: project.owner.id,
        name: project.owner.name,
        username: project.owner.emailVerified ? project.owner.name.toLowerCase().replace(/\s+/g, "-") : "member",
        collegeVerified: project.owner.emailVerified,
        avatarUrl: project.owner.image ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(project.owner.name)}&background=222&color=fff`,
        branchOrMajor: project.owner.branchYear || "I2IT student",
      },
      collaboratorsCount: (project._count?.members ?? 0) + 1,
      verifiedCommitsCount: 0,
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
    <LandingPage 
      initialProjects={directory} 
      isAuthenticated={Boolean(session)} 
      userEmail={session?.user?.email} 
    />
  );
}
