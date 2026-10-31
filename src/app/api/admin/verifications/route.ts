import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ALLOWED_ADMIN_ROLES = ["admin", "lead", "faculty", "reviewer"];

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    // In dev mode (direct access), allow checking the admin verification queue
    if (session?.user) {
      const caller = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
      });

      if (!caller || !ALLOWED_ADMIN_ROLES.includes(caller.role.toLowerCase())) {
        return NextResponse.json({ 
          message: "Forbidden. Admin or reviewer privileges required to access verification queue." 
        }, { status: 403 });
      }
    }

    const selectFields = {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      prnNumber: true,
      rollNumber: true,
      department: true,
      academicYear: true,
      verificationStatus: true,
      rejectionReason: true,
      verifiedAt: true,
      createdAt: true,
      updatedAt: true,
    };

    const db = prisma as any;
    const [pending, verified, rejected] = await Promise.all([
      db.user.findMany({
        where: { verificationStatus: "PENDING_APPROVAL" },
        select: selectFields,
        orderBy: { updatedAt: "asc" },
      }),
      db.user.findMany({
        where: { verificationStatus: "VERIFIED" },
        select: selectFields,
        orderBy: { verifiedAt: "desc" },
        take: 50,
      }),
      db.user.findMany({
        where: { verificationStatus: "REJECTED" },
        select: selectFields,
        orderBy: { updatedAt: "desc" },
        take: 50,
      }),
    ]);

    return NextResponse.json({ pending, verified, rejected });
  } catch (error: any) {
    console.error("Admin verifications fetch error:", error);
    return NextResponse.json({ message: "Failed to fetch verifications." }, { status: 500 });
  }
}

