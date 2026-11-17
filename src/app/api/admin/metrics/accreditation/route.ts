import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminCaller } from "@/lib/admin-caller";
import { canChangeUserRole } from "@/lib/permissions";
import { ForbiddenError, handleApiError } from "@/lib/errors";

export const dynamic = "force-dynamic";

interface DepartmentMetrics {
  total: number;
  verified: number;
}

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
      commitsByDepartmentAndMonth,
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
      // Total verified open-source contributions
      prisma.verifiedContribution.count({
        where: { verifiedByGitHub: true },
      }),
      // Aggregate verified pushes and explicitly labeled seed samples by department and month.
      prisma.$queryRaw<
        Array<{ department: string | null; month: string; source: string; commits: bigint }>
      >`
        SELECT
          users."department" AS "department",
          TO_CHAR(DATE_TRUNC('month', contributions."createdAt"), 'YYYY-MM') AS "month",
          contributions."source" AS "source",
          COUNT(contributions."id") AS "commits"
        FROM "VerifiedContribution" AS contributions
        INNER JOIN "User" AS users ON users."id" = contributions."userId"
        WHERE users."role" = 'student'
          AND contributions."type" = 'commit_pushed'
          AND (
            contributions."verifiedByGitHub" = TRUE
            OR contributions."source" = 'seed_demo'
          )
          AND contributions."createdAt" >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '11 months'
        GROUP BY users."department", DATE_TRUNC('month', contributions."createdAt"), contributions."source"
        ORDER BY "month" ASC
      `,
    ]);

    const byDepartment = new Map<string, DepartmentMetrics>();
    const getDepartmentMetrics = (departmentName: string | null) => {
      const name = departmentName?.trim() || "General / Unassigned";
      let department = byDepartment.get(name);
      if (!department) {
        department = { total: 0, verified: 0 };
        byDepartment.set(name, department);
      }
      return department;
    };

    for (const item of departmentGroups) {
      const department = getDepartmentMetrics(item.department);
      department.total += item._count._all;

      if (item.verificationStatus === "VERIFIED") {
        department.verified += item._count._all;
      }
    }

    return NextResponse.json(
      {
        totalStudents,
        verifiedStudents,
        byDepartment: Object.fromEntries(byDepartment),
        totalVerifiedContributions,
        commitTrend: commitsByDepartmentAndMonth.map((item) => ({
          department: item.department?.trim() || "General / Unassigned",
          month: item.month,
          commits: Number(item.commits),
          isDemoData: item.source === "seed_demo",
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

