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
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    
    if (session?.user) {
      const caller = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, name: true, role: true },
      });
      
      if (caller && canVerifyStudents(caller.role)) {
        return caller;
      }
    }
  } catch {
    // Gracefully fall through to local fallback in preview/dev testing
  }

  // In local development / preview testing without an active cookie session,
  // resolve to an existing registered admin account in the database first.
  if (process.env.NODE_ENV !== "production") {
    const adminFallback = await prisma.user.findFirst({
      where: { role: "admin" },
      select: { id: true, name: true, role: true },
    });
    if (adminFallback) return adminFallback;

    const fallback = await prisma.user.findFirst({
      where: {
        role: { in: ["faculty", "lead", "reviewer"] },
      },
      select: { id: true, name: true, role: true },
    });
    if (fallback) return fallback;
  }

  return null;
}

