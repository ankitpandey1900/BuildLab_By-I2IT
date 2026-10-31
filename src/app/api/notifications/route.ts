import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ message: "Sign in required." }, { status: 401 });
  const notifications = await prisma.$queryRaw<{ id: string; type: string; title: string; body: string; href: string | null; readAt: Date | null; createdAt: Date }[]>`
    SELECT "id", "type", "title", "body", "href", "readAt", "createdAt"
    FROM "Notification" WHERE "userId" = ${session.user.id} ORDER BY "createdAt" DESC LIMIT 30`;
  return NextResponse.json(notifications);
}

export async function PATCH() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ message: "Sign in required." }, { status: 401 });
  await prisma.$executeRaw`UPDATE "Notification" SET "readAt" = NOW() WHERE "userId" = ${session.user.id} AND "readAt" IS NULL`;
  return NextResponse.json({ read: true });
}
