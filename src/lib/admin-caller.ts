import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canVerifyStudents } from "@/lib/permissions";

export interface AdminCaller {
  id: string;
  name: string;
  role: string;
}

export async function getAdminCaller(): Promise<AdminCaller | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;

  const caller = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, role: true },
  });

  return caller && canVerifyStudents(caller.role) ? caller : null;
}

