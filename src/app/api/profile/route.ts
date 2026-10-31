import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const profileSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  bio: z.string().trim().max(500).optional(),
  branchYear: z.string().trim().max(80).optional(),
  skills: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
  interests: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
  availability: z.number().int().min(0).max(80).optional(),
});

async function currentUser() {
  return auth.api.getSession({ headers: await headers() });
}

export async function GET() {
  const session = await currentUser();
  if (!session) return NextResponse.json({ message: "Sign in required." }, { status: 401 });
  const db = prisma as any;
  const [user, githubAccount, verifiedContributions] = await Promise.all([
    db.user.findUnique({ where: { id: session.user.id } }),
    db.account.findFirst({
      where: { userId: session.user.id, providerId: "github" },
      select: { accountId: true },
    }),
    db.verifiedContribution.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);
  return NextResponse.json({
    ...user,
    githubConnected: Boolean(githubAccount),
    githubUsername: githubAccount?.accountId ?? null,
    verifiedContributions,
  });
}

export async function PATCH(request: Request) {
  const session = await currentUser();
  if (!session) return NextResponse.json({ message: "Sign in required." }, { status: 401 });
  const result = profileSchema.safeParse(await request.json());
  if (!result.success) return NextResponse.json({ message: "Invalid profile details." }, { status: 400 });
  const data = result.data;
  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...data,
      skills: data.skills ? JSON.stringify(data.skills) : undefined,
      interests: data.interests ? JSON.stringify(data.interests) : undefined,
    },
  });
  return NextResponse.json(user);
}
