import prisma from "@/lib/prisma"; // adjust path to your prisma client
import { NextResponse } from "next/server";

// GET /api/teams/[servicesId]
export async function GET(
  req: Request,
  { params }: { params: { servicesId: string } }
) {
  try {
    const { servicesId } = params;

    if (!servicesId) {
      return NextResponse.json(
        { error: "Service ID is required" },
        { status: 400 }
      );
    }

    const teams = await prisma.team.findMany({
      where: {
        serviceId: servicesId,
      },
    });

    return NextResponse.json(teams, { status: 200 });
  } catch (error) {
    console.error("Error fetching teams:", error);
    return NextResponse.json(
      { error: "Failed to fetch teams" },
      { status: 500 }
    );
  }
}
