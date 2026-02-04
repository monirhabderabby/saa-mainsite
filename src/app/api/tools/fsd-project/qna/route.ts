import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const searchParams = req.nextUrl.searchParams;
  const projectId = searchParams.get("projectId");

  if (!projectId) {
    return NextResponse.json(
      { success: false, message: "Project ID is required" },
      { status: 400 },
    );
  }

  const data = await prisma.projectQna.findMany({
    where: {
      projectId: projectId,
    },
  });

  return NextResponse.json({
    success: true,
    data: data ?? [],
  });
}
