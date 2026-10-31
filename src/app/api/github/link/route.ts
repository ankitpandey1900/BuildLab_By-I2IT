import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const db = prisma as any;

const linkSchema = z.object({
  githubUsername: z
    .string()
    .trim()
    .min(1)
    .max(39)
    .regex(/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/, "Invalid GitHub username format."),
});

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ message: "Sign in required." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = linkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message || "Invalid GitHub username." },
      { status: 400 }
    );
  }

  const { githubUsername } = parsed.data;

  // Check if account already exists for another user
  const existingOther = await db.account.findFirst({
    where: {
      providerId: "github",
      accountId: { equals: githubUsername, mode: "insensitive" },
      userId: { not: session.user.id },
    },
  });

  if (existingOther) {
    return NextResponse.json(
      { message: "This GitHub account is already connected to another student profile." },
      { status: 409 }
    );
  }

  // Upsert user's GitHub account record
  const existingUserAccount = await db.account.findFirst({
    where: {
      userId: session.user.id,
      providerId: "github",
    },
  });

  if (existingUserAccount) {
    await db.account.update({
      where: { id: existingUserAccount.id },
      data: { accountId: githubUsername },
    });
  } else {
    await db.account.create({
      data: {
        id: `github_${session.user.id}`,
        userId: session.user.id,
        providerId: "github",
        accountId: githubUsername,
      },
    });
  }

  // Audit event
  await db.auditEvent.create({
    data: {
      actorId: session.user.id,
      action: "github.account_linked",
      target: githubUsername,
    },
  });

  return NextResponse.json({
    success: true,
    connected: true,
    githubUsername,
  });
}

