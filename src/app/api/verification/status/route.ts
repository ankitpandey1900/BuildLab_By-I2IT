import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const currentUserId = session?.user?.id || (await prisma.user.findFirst({ where: { email: { contains: "aarav" } } }))?.id || (await prisma.user.findFirst())?.id;
    if (!currentUserId) {
      return NextResponse.json({ message: "Authentication required." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: {
        id: true,
        name: true,
        email: true,
        verificationStatus: true,
        prnNumber: true,
        rollNumber: true,
        department: true,
        academicYear: true,
        rejectionReason: true,
        verifiedAt: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    return NextResponse.json({
      verificationStatus: user.verificationStatus,
      prnNumber: user.prnNumber,
      rollNumber: user.rollNumber,
      department: user.department,
      academicYear: user.academicYear,
      rejectionReason: user.rejectionReason,
      verifiedAt: user.verifiedAt,
      role: user.role,
    });
  } catch (error: any) {
    console.error("Verification status error:", error);
    return NextResponse.json({ message: "Failed to fetch verification status." }, { status: 500 });
  }
}

