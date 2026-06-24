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
      select: {
        role: true,
        managedServices: { select: { id: true } },
        userTeams: { select: { teamId: true, responsibility: true } },
      },
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
    const baseWhere: Prisma.QueueWhereInput = {};

    // ─── Operation role-scoped visibility ──────────────────────────────────────
    // Admin / Super Admin / Sales keep their see-all behaviour (no filter).
    // For OPERATION_MEMBER the visible queues depend on their position:
    //   • Service Manager → queues from all users in his managed service(s)
    //   • Team Leader/Coleader → queues from all members of his team(s)
    //   • Plain Member → only his own queues
    if (user.role === "OPERATION_MEMBER") {
      const managedServiceIds = user.managedServices.map((s) => s.id);
      const leaderTeamIds = user.userTeams
        .filter((ut) => ut.responsibility === "Leader" || ut.responsibility === "Coleader")
        .map((ut) => ut.teamId);

      // Always include the user's own queues.
      const allowedRequesterIds = new Set<string>([session.user.id]);

      if (managedServiceIds.length > 0) {
        // Service manager → everyone belonging to the managed service(s).
        const serviceUsers = await prisma.user.findMany({
          where: { serviceId: { in: managedServiceIds } },
          select: { id: true },
        });
        serviceUsers.forEach((u) => allowedRequesterIds.add(u.id));
      } else if (leaderTeamIds.length > 0) {
        // Team leader/coleader → all members of his team(s).
        const teamMembers = await prisma.userTeam.findMany({
          where: { teamId: { in: leaderTeamIds } },
          select: { userId: true },
        });
        teamMembers.forEach((m) => allowedRequesterIds.add(m.userId));
      }
      // else: plain member → only the own id already in the set.

      baseWhere.requestedById = { in: Array.from(allowedRequesterIds) };
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
    const filteredWhere: Prisma.QueueWhereInput = { ...baseWhere };

    if (status && ["REQUESTED", "GIVEN"].includes(status)) {
      filteredWhere.status = status;
    }

    // ─── Run all queries in a single transaction ───────────────────────────────
    const [queues, filteredTotal, requestedCount, givenCount] =
      await prisma.$transaction([
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
            // ✅ Include service
            service: {
              select: { id: true, name: true },
            },
          },
          orderBy: {
            createdAt:
              status === "GIVEN"
                ? "desc"
                : status === "REQUESTED"
                  ? "asc"
                  : "desc",
          },
          skip,
          take: limit,
        }),

        prisma.queue.count({ where: filteredWhere }),

        prisma.queue.count({
          where: { ...baseWhere, status: "REQUESTED" },
        }),

        prisma.queue.count({
          where: { ...baseWhere, status: "GIVEN" },
        }),
      ]);

    const totalPages = Math.ceil(filteredTotal / limit);

    return NextResponse.json({
      success: true,
      message: "Queues fetched successfully.",
      data: queues,
      counts: {
        all: requestedCount + givenCount,
        requested: requestedCount,
        given: givenCount,
      },
      pagination: {
        total: filteredTotal,
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
