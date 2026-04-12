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

    // Pagination
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") ?? "10", 10)),
    );
    const skip = (page - 1) * limit;

    // Filters
    const status = searchParams.get("status") as "REQUESTED" | "GIVEN" | null;
    const profileIdsParam = searchParams.get("profileIds")?.trim() || null;
    const clientName = searchParams.get("clientName")?.trim() || null;
    const orderId = searchParams.get("orderId")?.trim() || null;
    const queueKey = searchParams.get("queueKey")?.trim() || null;

    const profileIds = profileIdsParam
      ? profileIdsParam
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean)
      : [];

    // Build where clause
    const where: Prisma.QueueWhereInput = {};

    // OPERATION role can only see their own queues
    if (user.role === "OPERATION_MEMBER") {
      where.requestedById = session.user.id;
    }

    if (status && ["REQUESTED", "GIVEN"].includes(status)) {
      where.status = status;
    }

    if (profileIds.length > 0) {
      where.profileId = { in: profileIds };
    }

    if (clientName) {
      where.clientName = { contains: clientName, mode: "insensitive" };
    }

    if (orderId) {
      where.orderId = { contains: orderId, mode: "insensitive" };
    }

    if (queueKey) {
      where.queueKey = { contains: queueKey, mode: "insensitive" };
    }

    const [queues, total] = await prisma.$transaction([
      prisma.queue.findMany({
        where,
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
      prisma.queue.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      message: "Queues fetched successfully.",
      data: queues,
      pagination: {
        total,
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
