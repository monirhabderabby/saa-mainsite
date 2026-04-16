// app/api/queues/route.ts
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
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

    const { searchParams } = req.nextUrl;

    // ─── Pagination ────────────────────────────────────────────────────────────
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") ?? "10", 10)),
    );
    const skip = (page - 1) * limit;

    // ─── Filters ───────────────────────────────────────────────────────────────
    const status = searchParams.get("status") as "REQUESTED" | "GIVEN" | null;
    const profileIdsParam = searchParams.get("profileIds")?.trim() || null;
    const searchQuery = searchParams.get("searchQuery")?.trim() || null;

    const profileIds = profileIdsParam
      ? profileIdsParam
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean)
      : [];

    // ─── Base where (no status filter) ────────────────────────────────────────
    // Used for stable counts — so the stat strip always shows real totals
    // regardless of which status tab the user has selected.
    const baseWhere: Prisma.QueueWhereInput = {};

    if (user.role === "OPERATION_MEMBER") {
      baseWhere.requestedById = session.user.id;
    }

    if (profileIds.length > 0) {
      baseWhere.profileId = { in: profileIds };
    }

    if (searchQuery) {
      baseWhere.OR = [
        {
          clientName: {
            equals: searchQuery,
            mode: "insensitive",
          },
        },
        {
          orderId: {
            contains: searchQuery,
            mode: "insensitive",
          },
        },
        {
          queueKey: {
            contains: searchQuery,
            mode: "insensitive",
          },
        },
      ];
    }

    // ─── Filtered where (includes status) ─────────────────────────────────────
    // Used for the actual queue list query and its paginated total.
    const filteredWhere: Prisma.QueueWhereInput = { ...baseWhere };

    if (status && ["REQUESTED", "GIVEN"].includes(status)) {
      filteredWhere.status = status;
    }

    // ─── Run all queries in a single transaction ───────────────────────────────
    const [queues, filteredTotal, requestedCount, givenCount] =
      await prisma.$transaction([
        // 1. Paginated queue list (respects status filter)
        prisma.queue.findMany({
          where: filteredWhere,
          include: {
            requestedBy: {
              select: { id: true, fullName: true, email: true, role: true },
            },
            assignedTo: {
              select: { id: true, fullName: true, email: true, role: true },
            },
            links: {
              orderBy: { createdAt: "asc" },
            },
            profile: true,
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),

        // 2. Total matching the current status filter (for pagination)
        prisma.queue.count({ where: filteredWhere }),

        // 3. Real REQUESTED count (ignores status filter)
        prisma.queue.count({
          where: { ...baseWhere, status: "REQUESTED" },
        }),

        // 4. Real GIVEN count (ignores status filter)
        prisma.queue.count({
          where: { ...baseWhere, status: "GIVEN" },
        }),
      ]);

    const totalPages = Math.ceil(filteredTotal / limit);

    return NextResponse.json({
      success: true,
      message: "Queues fetched successfully.",
      data: queues,
      // Stable counts — always reflect real totals, not the active filter
      counts: {
        all: requestedCount + givenCount,
        requested: requestedCount,
        given: givenCount,
      },
      pagination: {
        total: filteredTotal, // respects status filter (drives "X of Y" pagination UI)
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    console.error("❌ GET /api/queues error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while fetching queues.",
      },
      { status: 500 },
    );
  }
}
