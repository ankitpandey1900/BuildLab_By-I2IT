import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ProjectMember } from "@prisma/client";

export const dynamic = "force-dynamic";

const handoverSchema = z.object({
  newOwnerId: z.string().trim().min(1, "newOwnerId is required"),
});

/**
 * Helper to determine whether a member's role is maintainer (exact matching).
 */
function isMaintainerRole(role: string): boolean {
  return role.trim().toLowerCase() === "maintainer";
}

/**
 * Validate that the new owner is an accepted project member with a maintainer role.
 */
function validateNewOwnerEligibility(
  newOwnerMember: ProjectMember | null,
  currentOwnerId: string,
  newOwnerId: string
): { isValid: boolean; errorMessage?: string } {
  if (newOwnerId === currentOwnerId) {
    return {
      isValid: false,
      errorMessage: "New owner cannot be the current project owner.",
    };
  }

  if (!newOwnerMember) {
    return {
      isValid: false,
      errorMessage: "New owner must be an accepted project member.",
    };
  }

  if (!isMaintainerRole(newOwnerMember.role)) {
    return {
      isValid: false,
      errorMessage: "New owner must be a project maintainer.",
    };
  }

  return { isValid: true };
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params;

  // 1. Request Body Validation
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request payload." }, { status: 400 });
  }

  const parsed = handoverSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid request payload." }, { status: 400 });
  }
  const { newOwnerId } = parsed.data;

  // 2. Authentication Verification
  let session;
  try {
    let reqHeaders: Headers;
    try {
      reqHeaders = await headers();
    } catch {
      reqHeaders = new Headers(request.headers);
    }
    session = await auth.api.getSession({ headers: reqHeaders });
  } catch (authError) {
    console.error("Authentication infrastructure error:", authError);
    return NextResponse.json(
      { message: "Authentication service unavailable." },
      { status: 500 }
    );
  }

  if (!session) {
    return NextResponse.json({ message: "Sign in required." }, { status: 401 });
  }

  // 3. Project Lookup & Strict Ownership Authorization
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    return NextResponse.json({ message: "Project not found." }, { status: 404 });
  }

  // Only the current project owner can hand over ownership.
  // Maintainers and platform admins are explicitly denied.
  if (project.ownerId !== session.user.id) {
    return NextResponse.json(
      { message: "Only the current project owner can transfer project ownership." },
      { status: 403 }
    );
  }

  // 4. Pre-flight Validate Memberships Before Initiating Transfer
  // Both old owner and new owner must have membership records in this project.
  const [oldOwnerMember, newOwnerMember] = await Promise.all([
    prisma.projectMember.findFirst({
      where: {
        projectId,
        userId: session.user.id,
      },
    }),
    prisma.projectMember.findFirst({
      where: {
        projectId,
        userId: newOwnerId,
      },
    }),
  ]);

  if (!oldOwnerMember) {
    return NextResponse.json(
      { message: "Previous owner's project membership record is missing." },
      { status: 400 }
    );
  }

  const eligibility = validateNewOwnerEligibility(newOwnerMember, project.ownerId, newOwnerId);
  if (!eligibility.isValid) {
    return NextResponse.json(
      { message: eligibility.errorMessage || "Invalid new owner eligibility." },
      { status: 400 }
    );
  }

  // 5. Atomic Ownership & Membership Transfer via Prisma Transaction
  try {
    await prisma.$transaction(async (tx) => {
      // Revalidate membership inside transaction to protect against concurrent modifications
      const [txOldOwnerMember, txNewOwnerMember] = await Promise.all([
        tx.projectMember.findFirst({
          where: {
            projectId,
            userId: session.user.id,
          },
        }),
        tx.projectMember.findFirst({
          where: {
            projectId,
            userId: newOwnerId,
          },
        }),
      ]);

      if (!txOldOwnerMember) {
        throw new Error("OLD_OWNER_MEMBER_MISSING");
      }

      const txEligibility = validateNewOwnerEligibility(
        txNewOwnerMember,
        project.ownerId,
        newOwnerId
      );
      if (!txEligibility.isValid) {
        throw new Error(txEligibility.errorMessage || "NEW_OWNER_ELIGIBILITY_INVALID");
      }

      // Guard against concurrent ownership transfer
      const updateProjectResult = await tx.project.updateMany({
        where: {
          id: projectId,
          ownerId: session.user.id,
        },
        data: {
          ownerId: newOwnerId,
          handoverFlagged: false,
        },
      });

      if (updateProjectResult.count === 0) {
        throw new Error("CONCURRENT_OWNERSHIP_CONFLICT");
      }

      // Operation B: Transition previous owner's role to "mentor"
      await tx.projectMember.update({
        where: {
          id: txOldOwnerMember.id,
        },
        data: {
          role: "mentor",
        },
      });

      // Operation C: Transition new owner's role to "lead"
      await tx.projectMember.update({
        where: {
          id: txNewOwnerMember!.id,
        },
        data: {
          role: "lead",
        },
      });

      // Operation D: Record required audit event in the same transaction
      await tx.auditEvent.create({
        data: {
          actorId: session.user.id,
          action: "PROJECT_OWNERSHIP_TRANSFERRED",
          target: projectId,
          metadata: {
            projectId,
            projectName: project.name,
            previousOwnerId: session.user.id,
            newOwnerId,
          },
        },
      });
    });

    // 6. Return Successful Response
    return NextResponse.json({
      message: "Project ownership transferred successfully.",
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === "CONCURRENT_OWNERSHIP_CONFLICT") {
        return NextResponse.json(
          { message: "Project ownership has already changed or concurrent transfer conflict." },
          { status: 409 }
        );
      }
      if (error.message === "OLD_OWNER_MEMBER_MISSING") {
        return NextResponse.json(
          { message: "Previous owner's project membership record is missing." },
          { status: 400 }
        );
      }
      if (
        error.message === "New owner cannot be the current project owner." ||
        error.message === "New owner must be an accepted project member." ||
        error.message === "New owner must be a project maintainer."
      ) {
        return NextResponse.json({ message: error.message }, { status: 400 });
      }
    }

    console.error("Failed to transfer project ownership:", error);
    return NextResponse.json(
      { message: "Failed to transfer project ownership." },
      { status: 500 }
    );
  }
}
