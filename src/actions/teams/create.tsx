"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import {
  addMemberSchema,
  AddMemberSchema,
  teamSchema,
  TeamSchemaType,
} from "@/schemas/team";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";

const allowedRoles = ["SUPER_ADMIN", "ADMIN"] as Role[];

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

export async function addMemberToteamAction(data: AddMemberSchema) {
  const session = await auth();

  // 🔒 Authentication check
  if (!session || !session.user) {
    return {
      success: false,
      message: "You must be logged in to perform this action.",
    };
  }

  // 🔒 Authorization check
  if (!allowedRoles.includes(session.user.role as Role)) {
    return {
      success: false,
      message: "You don't have permission to add members to a team.",
    };
  }

  // ✅ Validate incoming data
  const parsedData = addMemberSchema.safeParse(data);
  if (!parsedData.success) {
    return {
      success: false,
      message: parsedData.error.message,
    };
  }

  const { teamId, members } = parsedData.data;

  try {
    // 1. Check if team exists
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      return {
        success: false,
        message: "Team not found.",
      };
    }

    // 2. Find existing memberships
    const existingMembers = await prisma.userTeam.findMany({
      where: {
        teamId,
        userId: { in: members },
      },
      select: { userId: true },
    });

    const existingIds = existingMembers.map((m) => m.userId);

    // 3. Filter out already existing members
    const newMembers = members.filter((m) => !existingIds.includes(m));

    if (newMembers.length === 0) {
      return {
        success: false,
        message: "All selected members are already in the team.",
      };
    }

    // 4. Insert only new members
    await prisma.userTeam.createMany({
      data: newMembers.map((userId) => ({
        userId,
        teamId,
      })),
    });

    revalidatePath(`/teams/manage-teams/${team.serviceId}`);

    return {
      success: true,
      message:
        existingIds.length > 0
          ? `Successfully added ${newMembers.length} member(s). (${existingIds.length} already in the team and were skipped.)`
          : `Successfully added ${newMembers.length} member(s).`,
    };
  } catch (error) {
    console.error("❌ addMemberToteamAction error:", error);
    return {
      success: false,
      message: "Something went wrong while adding members.",
    };
  }
}
