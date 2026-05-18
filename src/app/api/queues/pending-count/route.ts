// app/api/queues/pending-count/route.ts
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/queues/pending-count
 *
 * Returns the number of REQUESTED (not yet GIVEN) queues scoped to the
 * station profiles managed by the current SALES_MEMBER user.
 *
 * Only meaningful for SALES_MEMBER — other roles receive { count: 0 }.
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404 },
      );
    }

    // Badge is only relevant for SALES_MEMBER
    if (user.role !== "SALES_MEMBER") {
      return NextResponse.json({ success: true, count: 0 });
    }

    // Resolve the station profiles assigned to this user
    const stationAssignments = await prisma.stationAssignmentProfile.findMany({
      where: {
        assignment: {
          userId: session.user.id,
        },
      },
      select: { profileId: true },
    });

    const profileIds = stationAssignments.map((a) => a.profileId);

    // Count REQUESTED queues for those profiles
    const count = await prisma.queue.count({
      where: {
        status: "REQUESTED",
        ...(profileIds.length > 0 ? { profileId: { in: profileIds } } : {}),
      },
    });

    return NextResponse.json({ success: true, count });
  } catch (error) {
    console.error("❌ GET /api/queues/pending-count error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong.", count: 0 },
      { status: 500 },
    );
  }
}
