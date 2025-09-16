"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import {
  ResponsibilitySchemaType,
  responsibilityZodSchema,
} from "@/schemas/team";
import { Role, TeamResponsibility } from "@prisma/client";
import { revalidatePath } from "next/cache";

const allowedRoles: Role[] = ["SUPER_ADMIN", "ADMIN"];

export async function assignResponsibilityAction(
  data: ResponsibilitySchemaType
) {
  const session = await auth();

  // 🔒 Authentication
  if (!session || !session.user) {
    return {
      success: false,
      message: "You must be logged in to perform this action.",
    };
  }

  // 🔒 Authorization
  if (!allowedRoles.includes(session.user.role as Role)) {
    return {
      success: false,
      message: "You don't have permission to assign responsibilities.",
    };
  }

  // ✅ Validate incoming data
  const parsedData = responsibilityZodSchema.safeParse(data);
  if (!parsedData.success) {
    return {
      success: false,
      message: parsedData.error.message,
    };
  }

  const { responsibility, teamId, userId } = parsedData.data;

  try {
    // 1. Check if membership exists
    const membership = await prisma.userTeam.findFirst({
      where: { teamId, userId },
      include: {
        user: true,
        team: true,
      },
    });

    if (!membership) {
      return {
        success: false,
        message: "This user is not a member of the team.",
      };
    }

    // 2. If assigning Leader, check if one already exists
    if (responsibility === TeamResponsibility.Leader) {
      const existingLeader = await prisma.userTeam.findFirst({
        where: {
          teamId,
          responsibility: TeamResponsibility.Leader,
        },
        include: { user: true },
      });

      if (existingLeader && existingLeader.userId !== userId) {
        return {
          success: false,
          message: `Team "${membership.team.name}" already has a leader (${existingLeader.user.fullName || existingLeader.user.email}). Demote them first before assigning a new leader.`,
        };
      }
    }

    // 3. Update responsibility
    const updated = await prisma.userTeam.update({
      where: { id: membership.id },
      data: {
        responsibility: responsibility as TeamResponsibility,
      },
      include: { user: true, team: true },
    });

    // 4. Revalidate team page
    revalidatePath(`/teams/manage-teams/${updated.team.serviceId}`);

    return {
      success: true,
      message: `Updated ${updated.user.fullName || updated.user.email} to ${updated.responsibility} in team "${updated.team.name}".`,
    };
  } catch (error) {
    console.error("❌ assignResponsibilityAction error:", error);
    return {
      success: false,
      message: "Something went wrong while assigning responsibility.",
    };
  }
}
