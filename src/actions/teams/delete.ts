"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";
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
