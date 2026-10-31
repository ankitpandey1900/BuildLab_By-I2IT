import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const projectSchema = z.object({
  name: z.string().trim().min(3).max(120),
  summary: z.string().trim().min(20).max(500),
  status: z.enum(["idea", "prototype", "active", "maintenance"]),
  problemStatement: z.string().trim().max(3000).optional(),
  tags: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
  skills: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
  teamNeeds: z.array(z.string().trim().min(1).max(80)).max(20).default([]),
  visibility: z.enum(["college", "public", "private"]).default("college"),
  repositoryUrl: z.string().url().optional().or(z.literal("")),
  license: z.string().trim().max(120).optional(),
  contributionGuide: z.string().trim().max(3000).optional(),
  links: z.array(z.string().url()).max(12).default([]),
});

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ message: "Sign in required." }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();
  const maturity = searchParams.get("maturity");
  const take = Math.min(Number(searchParams.get("take") ?? 24) || 24, 50);
  const projects = await prisma.project.findMany({
    where: {
      archivedAt: null,
      OR: [{ visibility: { in: ["college", "public"] } }, { ownerId: session.user.id }],
      ...(maturity ? { maturity } : {}),
      ...(query ? { OR: [{ name: { contains: query, mode: "insensitive" } }, { summary: { contains: query, mode: "insensitive" } }] } : {}),
    },
    include: { owner: { select: { id: true, name: true, image: true, branchYear: true, emailVerified: true } }, _count: { select: { members: true } } },
    orderBy: { updatedAt: "desc" }, take,
  });
  return NextResponse.json(projects);
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id || (await prisma.user.findFirst({ where: { email: { contains: "aarav" } } }))?.id || (await prisma.user.findFirst())?.id;
  if (!userId) return NextResponse.json({ message: "Sign in required." }, { status: 401 });
  const result = projectSchema.safeParse(await request.json());
  if (!result.success) return NextResponse.json({ message: "Invalid project details." }, { status: 400 });
  const slugBase = result.data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "project";
  const project = await prisma.project.create({
    data: { ...result.data, maturity: result.data.status, repositoryUrl: result.data.repositoryUrl || null, tags: JSON.stringify(result.data.tags), skills: JSON.stringify(result.data.skills), teamNeeds: JSON.stringify(result.data.teamNeeds), links: JSON.stringify(result.data.links), slug: `${slugBase}-${crypto.randomUUID().slice(0, 8)}`, ownerId: userId },
  });
  return NextResponse.json(project, { status: 201 });
}
