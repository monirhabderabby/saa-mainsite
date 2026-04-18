"use server";

import prisma from "@/lib/prisma";

export async function getUserOptions() {
  try {
    const [departments, services, teams, designations] = await Promise.all([
      prisma.department.findMany({
        orderBy: { name: "asc" },
      }),
      prisma.services.findMany({
        orderBy: { name: "asc" },
      }),
      prisma.team.findMany({
        orderBy: { name: "asc" },
      }),
      prisma.designations.findMany({
        orderBy: { name: "asc" },
      }),
    ]);

    return {
      success: true,
      data: {
        departments,
        services,
        teams,
        designations,
      },
    };
  } catch (error) {
    console.error("Error fetching user options:", error);
    return {
      success: false,
      message: "Failed to fetch options.",
    };
  }
}
