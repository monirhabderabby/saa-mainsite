import prisma from "@/lib/prisma";

/**
 * Finds all SALES_MEMBER users who are assigned to a given profileId
 * via StationAssignmentProfile → StationAssignment → User
 */
export async function getSalesMembersForProfile(
  profileId: string,
): Promise<string[]> {
  const assignments = await prisma.stationAssignmentProfile.findMany({
    where: { profileId },
    include: {
      assignment: {
        include: {
          user: true,
        },
      },
    },
  });

  const userIds = assignments
    .map((a) => a.assignment.user)
    .filter((user) => user.role === "SALES_MEMBER")
    .map((user) => user.id);

  // Deduplicate
  return Array.from(new Set(userIds));
}
