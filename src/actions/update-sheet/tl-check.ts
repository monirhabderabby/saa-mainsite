"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";

const ALLOWED_ROLES: Role[] = ["SUPER_ADMIN", "ADMIN"];

/**
 * TL Check for an update sheet entry.
 *
 * Allowed if:
 * - Logged-in user is a Leader **or Co-Leader** in the same service line as the entry creator
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

  // Step 2: Fetch entry with creator info + their service
  const entry = await prisma.updateSheet.findUnique({
    where: { id },
    select: {
      id: true,
      tlId: true,
      updateById: true,
      updateBy: {
        select: {
          id: true,
          serviceId: true,
          service: { select: { id: true, serviceManagerId: true } },
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

  // Step 3: Fetch logged-in user role + teams with service
  const currentUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      role: true,
      userTeams: {
        select: {
          responsibility: true,
          team: { select: { serviceId: true } },
        },
      },
    },
  });

  if (!currentUser) {
    return {
      success: false,
      message: "Your account could not be found.",
    };
  }

  // ✅ Step 4: Check if current user is Leader or Co-Leader under the same service line
  const isServiceLineTeamLeaderOrCoLeader = currentUser.userTeams.some(
    (ut) =>
      (ut.responsibility === "Leader" || ut.responsibility === "Coleader") &&
      ut.team.serviceId === entry.updateBy.serviceId
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

  const canPerform =
    (isServiceLineTeamLeaderOrCoLeader || isServiceManager || isAdmin) &&
    userPermission?.isMessageTLCheckAllowed === true;

  if (!canPerform) {
    return {
      success: false,
      message:
        "Access denied. Insufficient permissions to perform this operation.",
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
