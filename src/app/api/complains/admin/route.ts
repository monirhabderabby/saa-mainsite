// /api/complains/me/route.ts

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

  const status = searchParams.get("status") as ComplaintStatus | null;
  const priority = searchParams.get("priority") as ComplaintPriority | null;

  const validStatus =
    status && Object.values(ComplaintStatus).includes(status)
      ? status
      : undefined;
  const validPriority =
    priority && Object.values(ComplaintPriority).includes(priority)
      ? priority
      : undefined;

  const where = {
    ...(validStatus && { status: validStatus }),
    ...(validPriority && { priority: validPriority }),
  };

  const [complaints, total] = await prisma.$transaction([
    prisma.complaint.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.complaint.count({ where }),
  ]);

  return NextResponse.json(
    {
      success: true,
      data: complaints,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    },
    { status: 200 },
  );
}
