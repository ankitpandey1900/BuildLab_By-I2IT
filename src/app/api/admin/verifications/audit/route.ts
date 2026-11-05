import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminCaller } from "@/lib/admin-caller";

const DEFAULT_AUDIT_LIMIT = 50;

export async function GET() {
  try {
    const adminCaller = await getAdminCaller();
    if (!adminCaller) {
      return NextResponse.json(
        { message: "Forbidden. Admin privileges required." },
        { status: 403 }
      );
    }

    const db = prisma as any;
    const events = await db.auditEvent.findMany({
      where: {
        action: {
          in: [
            "VERIFICATION_APPROVED",
            "VERIFICATION_REJECTED",
            "BATCH_VERIFICATION_APPROVED",
            "BATCH_VERIFICATION_REJECTED",
          ],
        },
      },
      orderBy: { createdAt: "desc" },
      take: DEFAULT_AUDIT_LIMIT,
    });

    return NextResponse.json({ events });
  } catch (error) {
    console.error("Failed to fetch verification audit events:", error);
    return NextResponse.json({ message: "Failed to fetch audit events." }, { status: 500 });
  }
}
