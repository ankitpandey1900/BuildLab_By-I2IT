import type { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminCaller } from "@/lib/admin-caller";
import { canChangeUserRole } from "@/lib/permissions";
import { BadRequestError, ForbiddenError, handleApiError } from "@/lib/errors";

const MAX_PAGE_SIZE = 50;

export async function GET(request: Request) {
  try {
    const admin = await getAdminCaller();
    if (!admin || !canChangeUserRole(admin.role)) {
      throw new ForbiddenError("Forbidden. Admin privileges required.");
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() ?? "";
    const page = Number(searchParams.get("page") ?? 1);
    const pageSize = Number(searchParams.get("pageSize") ?? 12);

    if (query.length > 100) {
      throw new BadRequestError("Search query must be 100 characters or fewer.");
    }
    if (!Number.isSafeInteger(page) || page < 1) {
      throw new BadRequestError("Page must be a positive whole number.");
    }
    if (!Number.isSafeInteger(pageSize) || pageSize < 1 || pageSize > MAX_PAGE_SIZE) {
      throw new BadRequestError(`Page size must be between 1 and ${MAX_PAGE_SIZE}.`);
    }
    if (!Number.isSafeInteger((page - 1) * pageSize)) {
      throw new BadRequestError("Requested page is too large.");
    }

    const where: Prisma.UserWhereInput = query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
            { prnNumber: { contains: query, mode: "insensitive" } },
            { department: { contains: query, mode: "insensitive" } },
            { role: { contains: query, mode: "insensitive" } },
          ],
        }
      : {};

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          department: true,
          prnNumber: true,
          verificationStatus: true,
          createdAt: true,
        },
        orderBy: [{ name: "asc" }, { id: "asc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return NextResponse.json({
      users,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
