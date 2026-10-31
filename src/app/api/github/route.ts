import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getCurrentUserId() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user.id;
}

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ message: "Sign in required." }, { status: 401 });

  const db = prisma as any;
  const [account, contributionsCount] = await Promise.all([
    db.account.findFirst({
      where: { userId, providerId: "github" },
      select: { accountId: true },
    }),
    db.verifiedContribution.count({ where: { userId } }),
  ]);

  return NextResponse.json({
    connected: Boolean(account),
    accountId: account?.accountId ?? null,
    username: account?.accountId ?? null,
    contributionsCount,
  });
}

export async function DELETE() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ message: "Sign in required." }, { status: 401 });

  await prisma.account.deleteMany({ where: { userId, providerId: "github" } });

  await prisma.auditEvent.create({
    data: {
      actorId: userId,
      action: "github.account_unlinked",
      target: "github",
    },
  });

  return NextResponse.json({ disconnected: true });
}
