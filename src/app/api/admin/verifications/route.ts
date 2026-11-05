import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminCaller } from "@/lib/admin-caller";

const DEFAULT_FETCH_LIMIT = 50;

export async function GET() {
  try {
    const adminCaller = await getAdminCaller();
    if (!adminCaller) {
      return NextResponse.json(
        { message: "Forbidden. Admin or reviewer privileges required." },
        { status: 403 }
      );
    }

    const selectFields = {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      bio: true,
      prnNumber: true,
      rollNumber: true,
      department: true,
      academicYear: true,
      verificationStatus: true,
      rejectionReason: true,
      verifiedAt: true,
      createdAt: true,
      updatedAt: true,
      verifiedBy: {
        select: {
          name: true,
        },
      },
      accounts: {
        where: { providerId: "github" },
        select: {
          accountId: true,
        },
        take: 1,
      },
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
        take: DEFAULT_FETCH_LIMIT,
      }),
      db.user.findMany({
        where: { verificationStatus: "REJECTED" },
        select: selectFields,
        orderBy: { updatedAt: "desc" },
        take: DEFAULT_FETCH_LIMIT,
      }),
    ]);

    return NextResponse.json({ pending, verified, rejected });
  } catch (error: any) {
    console.error("Admin verifications fetch error:", error);
    return NextResponse.json({ message: "Failed to fetch verifications." }, { status: 500 });
  }
}
