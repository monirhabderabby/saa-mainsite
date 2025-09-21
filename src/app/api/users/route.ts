// app/api/users/route.ts
import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const cu = await auth();

  if (!cu || !cu.user || !cu.user.id) {
    return Response.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const searchParams = req.nextUrl.searchParams;

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    // Optional filters (you can extend this as needed)
    const name = searchParams.get("name") || undefined;

    // Total count for pagination
    const totalItems = await prisma.user.count({
      where: name ? { fullName: { contains: name, mode: "insensitive" } } : {},
    });

    const totalPages = Math.ceil(totalItems / limit);

    // Fetch users with relations
    const data = await prisma.user.findMany({
      skip,
      take: limit,
      where: name ? { fullName: { contains: name, mode: "insensitive" } } : {},
      include: {
        service: true,
        permissions: true,
        designation: true,
        userTeams: {
          include: {
            team: true,
          },
        },
      },
    });

    return Response.json({
      success: true,
      data,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        pageSize: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error(error);
    return Response.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
