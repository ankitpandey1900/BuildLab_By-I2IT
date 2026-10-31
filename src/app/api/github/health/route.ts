import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = prisma as any;
    const [totalDeliveries, processedDeliveries, failedDeliveries, totalContributions, recentDeliveries] =
      await Promise.all([
        db.webhookDelivery.count(),
        db.webhookDelivery.count({ where: { status: "processed" } }),
        db.webhookDelivery.count({ where: { status: "error" } }),
        db.verifiedContribution.count(),
        db.webhookDelivery.findMany({
          orderBy: { receivedAt: "desc" },
          take: 10,
          select: {
            id: true,
            event: true,
            status: true,
            receivedAt: true,
            processedAt: true,
            error: true,
          },
        }),
      ]);

    const latestDelivery = recentDeliveries[0] ?? null;

    return NextResponse.json({
      status: failedDeliveries === 0 ? "healthy" : "degraded",
      stats: {
        totalDeliveries,
        processedDeliveries,
        failedDeliveries,
        totalContributions,
      },
      lastReceivedAt: latestDelivery?.receivedAt ?? null,
      recentDeliveries,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "unhealthy", message: error.message },
      { status: 500 }
    );
  }
}

