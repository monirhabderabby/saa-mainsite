import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { ComplaintPriority, ComplaintStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const cu = await auth();

  if (!cu?.user?.id) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const { searchParams } = req.nextUrl;

  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = Math.min(
    50,
    Math.max(1, Number(searchParams.get("limit") ?? 10)),
  );
  const skip = (page - 1) * limit;

  // ── Multi-value: ?status=OPEN&status=IN_PROGRESS
  const rawStatuses = searchParams.getAll("status");
  const rawPriorities = searchParams.getAll("priority");

  const validStatuses = rawStatuses.filter((s): s is ComplaintStatus =>
    Object.values(ComplaintStatus).includes(s as ComplaintStatus),
  );
  const validPriorities = rawPriorities.filter((p): p is ComplaintPriority =>
    Object.values(ComplaintPriority).includes(p as ComplaintPriority),
  );

  const where = {
    ...(validStatuses.length > 0 && { status: { in: validStatuses } }),
    ...(validPriorities.length > 0 && { priority: { in: validPriorities } }),
  };

  const [complaints, total] = await prisma.$transaction([
    prisma.complaint.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        creator: {
          include: {
            department: true,
            service: true,
            designation: true,
          },
        },
      },
    }),
    prisma.complaint.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    data: complaints,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  });
}
