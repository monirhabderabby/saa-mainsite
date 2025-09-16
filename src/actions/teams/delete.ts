"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { Role, TeamResponsibility } from "@prisma/client";
import { revalidatePath } from "next/cache";

const allowedRoles: Role[] = ["SUPER_ADMIN", "ADMIN"];

export async function deleteTeamAction(teamId: string) {
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
      message: "You don't have permission to delete a team.",
    };
  }

  if (!teamId) {
    return {
      success: false,
      message: "Team ID is required.",
    };
  }

  try {
    // 1. Check if team exists
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: { userTeams: true },
    });

    if (!team) {
      return {
        success: false,
        message: "Team not found.",
      };
    }

    // 2. Delete all members from team
    await prisma.userTeam.deleteMany({
      where: { teamId },
    });

    // 3. Delete the team itself
    const res = await prisma.team.delete({
      where: { id: teamId },
    });

    revalidatePath(`/teams/manage-teams/${res.serviceId}`);

    return {
      success: true,
      message: `Team "${team.name}" and ${team.userTeams.length} member(s) were removed successfully.`,
    };
  } catch (error) {
    console.error("❌ deleteTeamAction error:", error);
    return {
      success: false,
      message: "Something went wrong while deleting the team.",
    };
  }
}

export async function removeMember(userId: string, teamId: string) {
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
      message: "You don't have permission to remove a member from the team.",
    };
  }

  if (!teamId || !userId) {
    return {
      success: false,
      message: "Team ID and User ID are required.",
    };
  }

  try {
    // 1. Find the team and check membership
    const teamMember = await prisma.userTeam.findFirst({
      where: {
        teamId,
        userId,
      },
      include: {
        team: true,
        user: true,
      },
    });

    if (!teamMember) {
      return {
        success: false,
        message: "This user is not part of the team.",
      };
    }

    // 2. Block removal if Leader or Co-leader
    if (
      teamMember.responsibility === TeamResponsibility.Leader ||
      teamMember.responsibility === TeamResponsibility.Coleader
    ) {
      return {
        success: false,
        message: `Cannot remove ${teamMember.responsibility.toLowerCase()} directly. Demote them to "Member" first.`,
      };
    }

    // 3. Remove member
    await prisma.userTeam.delete({
      where: {
        id: teamMember.id,
      },
    });

    // 4. Revalidate team page
    revalidatePath(`/teams/manage-teams/${teamMember.team.serviceId}`);

    return {
      success: true,
      message: `User "${teamMember.user.fullName || teamMember.user.email}" was removed from team "${teamMember.team.name}".`,
    };
  } catch (error) {
    console.error("❌ removeMember error:", error);
    return {
      success: false,
      message: "Something went wrong while removing the member.",
    };
  }
}
