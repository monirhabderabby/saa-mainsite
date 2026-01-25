// app/api/projects/route.ts
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
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
  };
}>;

export async function GET(req: NextRequest) {
  const session = await auth();

  //   if (!session?.user?.id) {
  //     return NextResponse.json(
  //       { success: false, message: "Unauthorized" },
  //       { status: 401 },
  //     );
  //   }

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
  const teamId = searchParams.get("teamId") ?? undefined;
  const status = searchParams.get("status") ?? undefined;
  const assignedToMe = searchParams.get("assignedToMe") === "true";
  const search = searchParams.get("search")?.trim() || undefined;
  const clientName = searchParams.get("clientName")?.trim() || undefined;
  const orderId = searchParams.get("orderId")?.trim() || undefined;
  const fromDate = searchParams.get("fromDate"); // YYYY-MM-DD
  const toDate = searchParams.get("toDate"); // YYYY-MM-DD

  try {
    // Build where clause
    const where: Prisma.ProjectWhereInput = {};

    // Optional: only allow users to see projects in their team (uncomment/adjust logic)
    // where.teamId = teamIdFromUserSession ?? undefined;

    if (teamId) {
      where.teamId = teamId;
    }

    if (status) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      where.status = status as any; // assumes ProjectStatus is enum in prisma
    }

    if (clientName) {
      where.clientName = { contains: clientName, mode: "insensitive" };
    }

    if (orderId) {
      where.orderId = { contains: orderId, mode: "insensitive" };
    }

    if (search) {
      where.OR = [
        { clientName: { contains: search, mode: "insensitive" } },
        { orderId: { contains: search, mode: "insensitive" } },
        { remarkFromOperation: { contains: search, mode: "insensitive" } },
        { quickNoteFromLeader: { contains: search, mode: "insensitive" } },
      ];
    }

    // Date range filter (example: orderDate)
    if (fromDate || toDate) {
      where.orderDate = {};
      if (fromDate) where.orderDate.gte = new Date(fromDate);
      if (toDate) where.orderDate.lte = new Date(`${toDate}T23:59:59.999Z`);
    }

    // ─── Assigned to current user ──────────────────────
    if (assignedToMe) {
      where.OR = [
        { uiuxAssigned: { some: { userId } } },
        { backendAssigned: { some: { userId } } },
        { frontendAssigned: { some: { userId } } },
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
        _count: {
          select: {
            uiuxAssigned: true,
            backendAssigned: true,
            frontendAssigned: true,
            phase: true,
          },
        },

        // Optional: include phases if list is short
        phase: {
          select: { id: true, title: true, willBeDeliver: true },
        },

        // If you really need full assignees (careful with N+1):
        // uiuxAssigned: { select: { user: { select: { id: true, name: true } } } },
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
