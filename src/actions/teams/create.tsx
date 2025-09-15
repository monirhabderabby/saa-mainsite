"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { teamSchema, TeamSchemaType } from "@/schemas/team";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";

const allowedRoles = ["SUPER_ADMIN"] as Role[];

export async function createTeamAction(data: TeamSchemaType) {
  try {
    const session = await auth();

    // Authentication check
    if (!session || !session.user) {
      return {
        success: false,
        message: "You must be logged in to perform this action.",
      };
    }

    // Authorization check
    if (!allowedRoles.includes(session.user.role as Role)) {
      return {
        success: false,
        message: "You don't have permission to create a team.",
      };
    }

    // Data validation
    const parsedData = teamSchema.safeParse(data);
    if (!parsedData.success) {
      return {
        success: false,
        message: parsedData.error.message || "Invalid input.",
      };
    }

    // Check if team already exists under same service
    const exist = await prisma.team.findFirst({
      where: {
        name: parsedData.data.name,
        serviceId: parsedData.data.serviceId,
      },
    });

    if (exist) {
      return {
        success: false,
        message:
          "A team with this name already exists for the selected service.",
      };
    }

    // Create team
    const newTeam = await prisma.team.create({
      data: {
        name: parsedData.data.name,
        serviceId: parsedData.data.serviceId,
      },
    });

    revalidatePath(`/teams/manage-teams/${newTeam.serviceId}`);

    return {
      success: true,
      message: "Team created successfully.",
      data: newTeam,
    };
  } catch (error) {
    console.error("createTeamAction error:", error);
    return {
      success: false,
      message: "Something went wrong while creating the team.",
    };
  }
}
