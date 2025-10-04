import prisma from "@/lib/prisma";
import { Role, TeamResponsibility } from "@prisma/client";

type PermissionResult = {
  canEdit: boolean;
  reason?: string;
};

/**
 * Checks if a user can edit a given update sheet entry.
 *
 * Rules:
 * - Creator of the entry
 * - SUPER_ADMIN / ADMIN
 * - Service Manager of creator's service line
 * - Team Leader of the same team
 * - Team Leader of any team in the same service line
 *
 * @param userId - current logged-in user
 * @param entryId - update sheet entry id
 */
export async function canEditUpdateSheetEntry(
  userId: string,
  entryId: string
): Promise<PermissionResult> {
  // Fetch entry with creator
  const entry = await prisma.updateSheet.findUnique({
    where: { id: entryId },
    include: {
      updateBy: {
        select: {
          id: true,
          serviceId: true,
          service: { select: { serviceManagerId: true } },
          userTeams: { select: { teamId: true } },
        },
      },
    },
  });

  if (!entry) {
    return {
      canEdit: false,
      reason: "The requested update sheet entry does not exist.",
    };
  }

  // Fetch current user with role + teams
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      serviceId: true,
      userTeams: { select: { teamId: true, responsibility: true } },
    },
  });

  if (!currentUser) {
    return { canEdit: false, reason: "Your user account could not be found." };
  }

  // Rules
  const isCreator = userId === entry.updateById;
  if (isCreator) {
    return { canEdit: true };
  }

  const isAdmin =
    currentUser.role &&
    ["SUPER_ADMIN", "ADMIN"].includes(currentUser.role as Role);
  if (isAdmin) {
    return { canEdit: true };
  }

  const isServiceManager = entry.updateBy?.service?.serviceManagerId === userId;
  if (isServiceManager) {
    return {
      canEdit: true,
    };
  }

  const creatorTeamIds = entry.updateBy?.userTeams.map((t) => t.teamId) ?? [];
  const isSameTeamLeader = currentUser.userTeams.some(
    (ut) =>
      creatorTeamIds.includes(ut.teamId) &&
      ut.responsibility === TeamResponsibility.Leader
  );
  if (isSameTeamLeader) {
    return { canEdit: true };
  }

  const isTeamLeaderInSameService =
    currentUser.serviceId === entry.updateBy?.serviceId &&
    currentUser.userTeams.some(
      (ut) => ut.responsibility === TeamResponsibility.Leader
    );
  if (isTeamLeaderInSameService) {
    return { canEdit: true };
  }

  // If no rule matched
  return {
    canEdit: false,
    reason:
      "You do not have permission to edit this entry. Only the creator, their team leader, a leader from the same service line, the service manager, or an administrator can edit.",
  };
}
