// app/api/projects/route.ts
import { auth } from "@/auth";
import { getDayRange } from "@/lib/date";
import prisma from "@/lib/prisma";
import { Prisma, ProjectStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export type SafeProjectDto = Prisma.ProjectGetPayload<{
  include: {
    team: true;
    salesPerson: {
      select: {
        fullName: true;
        id: true;
        image: true;
        designation: {
          select: {
            name: true;
          };
        };
      };
    };
    phase: true;
    profile: true;
    projectAssignments: true;
  };
}>;

export async function GET(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const userId = session?.user.id;
  const searchParams = req.nextUrl.searchParams;

  // ─── Pagination ────────────────────────────────
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(
    50,
    Math.max(5, parseInt(searchParams.get("limit") || "10", 10)),
  );
  const skip = (page - 1) * limit;

  // ─── Filters ───────────────────────────────────
  const teamIdsParam = searchParams.getAll("teamIds");
  const statuses = searchParams.getAll("statuses");
  const assignedToMe = searchParams.get("assignedToMe") === "true";
  const search = searchParams.get("search")?.trim() || undefined;
  const clientName = searchParams.get("clientName")?.trim() || undefined;
  const orderId = searchParams.get("orderId")?.trim() || undefined;
  const fromDate = searchParams.get("fromDate");
  const toDate = searchParams.get("toDate");
  const deadlineFrom = searchParams.get("deadlineFrom");
  const deadlineTo = searchParams.get("deadlineTo");
  const profileId = searchParams.get("profileId");
  const shift = searchParams.get("shift");
  const nextUpdate = searchParams.get("nextUpdate");
  const lastUpdate = searchParams.get("lastUpdate");

  const teamIds = teamIdsParam
    .flatMap((id) => id.split(",")) // split comma-separated values
    .map((id) => id.trim())
    .filter(Boolean);

  const preparedStatuses = statuses
    .flatMap((id) => id.split(",")) // split comma-separated values
    .map((id) => id.trim())
    .filter(Boolean);

  try {
    // Build where clause
    const where: Prisma.ProjectWhereInput = {};

    // Optional: only allow users to see projects in their team (uncomment/adjust logic)
    // where.teamId = teamIdFromUserSession ?? undefined;

    if (teamIds && teamIds.length > 0) {
      where.teamId = {
        in: teamIds,
      };
    }

    if (profileId) {
      where.profileId = profileId;
    }

    if (shift) {
      where.shift = shift;
    }

    if (preparedStatuses && preparedStatuses.length > 0) {
      where.status = {
        in: preparedStatuses as ProjectStatus[],
      };
    }

    if (clientName) {
      where.clientName = { contains: clientName, mode: "insensitive" };
    }

    if (orderId) {
      where.OR = [
        { orderId: { contains: orderId, mode: "insensitive" } },
        { phase: { some: { orderId: orderId } } },
      ];
    }

    if (search) {
      where.OR = [
        { clientName: { contains: search, mode: "insensitive" } },
        { orderId: { contains: search, mode: "insensitive" } },
        { remarkFromOperation: { contains: search, mode: "insensitive" } },
        { quickNoteFromLeader: { contains: search, mode: "insensitive" } },
      ];
    }

    if (nextUpdate) {
      const { start, end } = getDayRange(nextUpdate);

      where.nextUpdate = {
        gte: start,
        lte: end,
      };
    }

    if (lastUpdate) {
      const { start, end } = getDayRange(lastUpdate);

      where.lastUpdate = {
        gte: start,
        lte: end,
      };
    }

    // Date range filter (example: orderDate)
    if (fromDate || toDate) {
      where.orderDate = {};
      if (fromDate) where.orderDate.gte = new Date(fromDate);
      if (toDate) where.orderDate.lte = new Date(`${toDate}T23:59:59.999Z`);
    }

    // Date range filter (example: deadline)

    if (deadlineFrom && deadlineFrom !== "All") {
      const { start } = getDayRange(deadlineFrom);

      let end: Date;
      if (deadlineTo && deadlineTo !== "All") {
        end = getDayRange(deadlineTo).end;
      } else {
        end = getDayRange(deadlineFrom).end;
      }

      where.deadline = {
        gte: start,
        lte: end,
      };
    } else if (
      deadlineFrom &&
      deadlineFrom !== "All" &&
      (!deadlineTo || deadlineTo === "All")
    ) {
      const { start, end } = getDayRange(deadlineFrom);
      where.deadline = { gte: start, lte: end };
    } else if (
      (!deadlineFrom || deadlineFrom === "All") &&
      deadlineTo &&
      deadlineTo !== "All"
    ) {
      where.deadline = { lte: new Date(deadlineTo) };
    }

    // ─── Assigned to current user ──────────────────────
    if (assignedToMe) {
      where.OR = [
        { userId }, // fallback / legacy field
      ];
    }

    // ─── Count total for pagination ────────
    const total = await prisma.project.count({ where });

    // ─── Fetch projects ─────────────────────
    const projects = await prisma.project.findMany({
      where,
      skip,
      take: limit,
      orderBy: [
        // You can make this dynamic later (sortBy, order)
        { createdAt: "desc" },
      ],
      select: {
        id: true,
        clientName: true,
        orderId: true,
        orderDate: true,
        deadline: true,
        value: true,
        monetaryValue: true,
        shift: true,
        status: true,
        delivered: true,
        lastUpdate: true,
        nextUpdate: true,
        remarkFromOperation: true,
        quickNoteFromLeader: true,
        review: true,
        instructionSheet: true,

        // Minimal relations – add more only when really needed
        team: {
          select: { id: true, name: true },
        },
        profile: {
          select: { id: true, name: true }, // adjust fields
        },
        salesPerson: {
          select: { id: true, fullName: true, email: true },
        },

        // Count assignees instead of fetching full list (better performance)

        // Optional: include phases if list is short
        phase: {
          select: { id: true, title: true, willBeDeliver: true },
        },

        // If you really need full assignees (careful with N+1):
        // uiuxAssigned: { select: { user: { select: { id: true, name: true } } } },
        projectAssignments: {
          select: {
            userId: true,
            role: true,
            assignedAt: true,
            id: true,
            projectId: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: projects,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: skip + limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (err) {
    console.error("[GET /api/projects]", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
