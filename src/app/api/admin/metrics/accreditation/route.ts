import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminCaller } from "@/lib/admin-caller";
import { canChangeUserRole } from "@/lib/permissions";
import { ForbiddenError, handleApiError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Step 1: Admin validation - only authorized administrators may view accreditation metrics
    const admin = await getAdminCaller();
    if (!admin || !canChangeUserRole(admin.role)) {
      throw new ForbiddenError("Forbidden. Admin privileges required.");
    }

    // Step 2 & 3: Database-level aggregations (Strictly no findMany in memory)
    const [
      totalStudents,
      verifiedStudents,
      departmentGroups,
      totalVerifiedContributions,
    ] = await Promise.all([
      // Total count of student accounts
      prisma.user.count({
        where: { role: "student" },
      }),
      // Count of verified students
      prisma.user.count({
        where: {
          role: "student",
          verificationStatus: "VERIFIED",
        },
      }),
      // Prisma database-level groupBy by department and verification status
      prisma.user.groupBy({
        by: ["department", "verificationStatus"],
        where: { role: "student" },
        _count: {
          _all: true,
        },
      }),
      // Step 3: Total verified open-source contributions
      prisma.verifiedContribution.count(),
    ]);

    // Step 4: Handle null departments & map into structured byDepartment format
    const byDepartment: Record<string, { verified: number; pending: number }> = {};

    for (const item of departmentGroups) {
      // Fallback for null/unassigned department in response formatting (does not change stored value)
      const departmentName = item.department?.trim() ? item.department.trim() : "General / Unassigned";

      if (!byDepartment[departmentName]) {
        byDepartment[departmentName] = {
          verified: 0,
          pending: 0,
        };
      }

      if (item.verificationStatus === "VERIFIED") {
        byDepartment[departmentName].verified += item._count._all;
      } else if (item.verificationStatus === "PENDING_APPROVAL") {
        byDepartment[departmentName].pending += item._count._all;
      }
    }

    // Step 5: Return structured statistics matching the accreditation metrics specification
    return NextResponse.json(
      {
        totalStudents,
        verifiedStudents,
        byDepartment,
        totalVerifiedContributions,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

