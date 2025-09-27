"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";

const ALLOWED_ROLES: Role[] = ["SUPER_ADMIN", "ADMIN"];

/**
 * TL Check for an update sheet entry.
 *
 * Allowed if:
 * - Logged-in user is a Leader in the same team as the entry creator
 * - Logged-in user is the Service Manager of the entry creator's service
 * - Logged-in user is Admin / Super Admin
 */
export async function tlCheck(id: string) {
  // Step 1: Authenticate user
  const session = await auth();
  if (!session?.user) {
    return {
      success: false,
      message: "Please log in to perform TL Check.",
    };
  }

  const { user } = session;

  // Step 2: Fetch entry with creator info + their service + their team
  const entry = await prisma.updateSheet.findUnique({
    where: { id },
    select: {
      id: true,
      tlId: true,
      updateById: true,
      updateBy: {
        select: {
          id: true,
          service: { select: { serviceManagerId: true } },
          userTeams: { select: { teamId: true } }, // entry creator’s team(s)
        },
      },
    },
  });

  if (!entry) {
    return {
      success: false,
      message: "Update sheet entry not found.",
    };
  }

  // Step 3: Fetch logged-in user role + team(s)
  const currentUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      role: true,
      userTeams: { select: { teamId: true, responsibility: true } },
    },
  });

  if (!currentUser) {
    return {
      success: false,
      message: "Your account could not be found.",
    };
  }

  // Step 4: Check if current user is leader of the same team as entry creator
  const creatorTeamIds = entry.updateBy.userTeams.map((t) => t.teamId);
  const isSameTeamLeader = currentUser.userTeams.some(
    (ut) => creatorTeamIds.includes(ut.teamId) && ut.responsibility === "Leader"
  );

  // Step 5: Check if current user is Service Manager of entry creator’s service
  const isServiceManager = entry.updateBy.service?.serviceManagerId === user.id;

  // Step 6: Check if current user is Admin / Super Admin
  const isAdmin = ALLOWED_ROLES.includes(currentUser.role);

  // Step 7: Permission check
  const userPermission = await prisma.permissions.findFirst({
    where: { userId: user.id, name: "UPDATE_SHEET" },
    select: { isMessageTLCheckAllowed: true },
  });

  if (
    (!isSameTeamLeader && !isServiceManager && !isAdmin) ||
    !userPermission?.isMessageTLCheckAllowed
  ) {
    return {
      success: false,
      message:
        "You are not allowed to perform TL Check. Only the same team Leader, the Service Manager of this service, or an Admin can do this.",
    };
  }

  // Step 8: Toggle TL check
  const isAlreadyChecked = entry.tlId;
  const updated = await prisma.updateSheet.update({
    where: { id },
    data: {
      tlId: isAlreadyChecked ? null : user.id,
      tlCheckAt: isAlreadyChecked ? null : new Date(),
    },
    select: { id: true, tlId: true, tlCheckAt: true },
  });

  return {
    success: true,
    message: isAlreadyChecked
      ? "TL Check has been removed."
      : "TL Check has been added successfully.",
    entry: updated,
  };
}
