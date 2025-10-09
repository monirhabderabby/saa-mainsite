"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";

/**
 * Assigns a team to an existing Issue Sheet.
 *
 * Authorization:
 * - Allowed for Leaders or Co-Leaders within the same service line as the issue.
 * - Allowed for the Service Manager of that service.
 *
 * @param teamId - The ID of the team to assign.
 * @param issueSheetId - The ID of the issue sheet to update.
 * @returns A success or failure response with an appropriate message.
 */

const adminsAndSalesRoles = ["ADMIN", "SUPER_ADMIN", "SALES_MEMBER"] as Role[];
export async function assignTeamIntoIssueSheet(
  teamId: string,
  issueSheetId: string
) {
  // Step 1: Authentication check
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return {
      success: false,
      message: "You must be logged in to assign a team to an issue.",
    };
  }

  // Step 2: Fetch the issue with related service and team info
  const issue = await prisma.issueSheet.findUnique({
    where: { id: issueSheetId },
    include: {
      service: {
        include: {
          serviceManager: { select: { id: true, fullName: true } },
          teams: {
            include: {
              userTeams: true,
            },
          },
        },
      },
    },
  });

  if (!issue) {
    return {
      success: false,
      message: "Issue sheet not found.",
    };
  }

  const { service } = issue;

  if (!service) {
    return {
      success: false,
      message: "Associated service not found for this issue sheet.",
    };
  }

  // Step 3: Authorization check
  const isLeaderOrCoLeader = service.teams.some((team) =>
    team.userTeams.some(
      (ut) =>
        ut.userId === userId &&
        ["Leader", "Coleader"].includes(ut.responsibility)
    )
  );

  const isServiceManager = service.serviceManager?.id === userId;

  const isAdminsOrSalesMember = adminsAndSalesRoles.includes(session.user.role);

  if (!isLeaderOrCoLeader && !isServiceManager && !isAdminsOrSalesMember) {
    return {
      success: false,
      message:
        "Access denied. Only Leaders, Co-Leaders, Service Managers, Admins, or Sales Members can assign a team to an issue sheet.",
    };
  }

  // Step 4: Update the issue sheet with the assigned team
  try {
    const updatedIssue = await prisma.issueSheet.update({
      where: { id: issueSheetId },
      data: { teamId },
    });

    return {
      success: true,
      message: "Team successfully assigned to the issue sheet.",
      data: updatedIssue,
    };
  } catch (error) {
    console.error("Error assigning team to issue sheet:", error);
    return {
      success: false,
      message:
        "An unexpected error occurred while assigning the team. Please try again.",
    };
  }
}
