import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageProject } from "@/lib/project-access";

const updateSchema = z.object({
  name: z.string().trim().min(3).max(120).optional(), summary: z.string().trim().min(20).max(500).optional(),
  problemStatement: z.string().trim().max(3000).optional(), maturity: z.enum(["idea", "prototype", "active", "maintenance", "paused"]).optional(),
  visibility: z.enum(["college", "public", "private"]).optional(), repositoryUrl: z.string().url().nullable().optional(),
  license: z.string().trim().max(120).nullable().optional(), contributionGuide: z.string().trim().max(3000).nullable().optional(),
  tags: z.array(z.string().trim().min(1).max(40)).max(20).optional(), skills: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
  teamNeeds: z.array(z.string().trim().min(1).max(80)).max(20).optional(), links: z.array(z.string().url()).max(12).optional(),
  readme: z.string().optional(), handoverFlagged: z.boolean().optional(),
});

async function authorizedProject(id: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { response: NextResponse.json({ message: "Sign in required." }, { status: 401 }) };
  const [user, project] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id }, select: { id: true, role: true } }),
    prisma.project.findUnique({
      where: { id },
      include: { members: { where: { userId: session.user.id } } },
    }),
  ]);
  if (!user || !project) return { response: NextResponse.json({ message: "Project not found." }, { status: 404 }) };
  const isMaintainer = project.members.some((m) => m.role === "maintainer");
  if (!canManageProject(user, project) && !isMaintainer) {
    return { response: NextResponse.json({ message: "You cannot manage this project." }, { status: 403 }) };
  }
  return { project, user, session };
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; 
  const allowed = await authorizedProject(id); 
  if (allowed.response) return allowed.response;
  const parsed = updateSchema.safeParse(await request.json()); 
  if (!parsed.success) return NextResponse.json({ message: "Invalid project details." }, { status: 400 });
  const data = parsed.data;
  const project = await prisma.project.update({ 
    where: { id }, 
    data: { 
      ...data, 
      status: data.maturity ?? undefined, 
      tags: data.tags ? JSON.stringify(data.tags) : undefined, 
      skills: data.skills ? JSON.stringify(data.skills) : undefined, 
      teamNeeds: data.teamNeeds ? JSON.stringify(data.teamNeeds) : undefined, 
      links: data.links ? JSON.stringify(data.links) : undefined 
    } 
  });
  if (allowed.session) {
    await prisma.auditEvent.create({
      data: {
        actorId: allowed.session.user.id,
        action: "project.updated",
        target: id,
        metadata: { name: project.name },
      },
    });
  }
  return NextResponse.json(project);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; 
  const allowed = await authorizedProject(id); 
  if (allowed.response) return allowed.response;
  const project = await prisma.project.update({ 
    where: { id }, 
    data: { archivedAt: new Date(), status: "archived" } 
  });
  if (allowed.session) {
    await prisma.auditEvent.create({
      data: {
        actorId: allowed.session.user.id,
        action: "project.archived",
        target: id,
        metadata: { name: project.name },
      },
    });
  }
  return NextResponse.json(project);
}
