import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";

interface Props {
  cuRole: Role;
  cuId: string;
  isServiceManager: boolean;
}

const allowedRoles = ["ADMIN", "SUPER_ADMIN", "OPERATION_MEMBER"] as Role[];
export async function isQueueAccess({ cuRole, cuId, isServiceManager }: Props) {
  const isRolesMatched = allowedRoles.includes(cuRole);

  if (!isRolesMatched) return false;

  const currentUserTeam = await prisma.userTeam.findFirst({
    where: {
      userId: cuId,
    },
    include: {
      team: {
        include: {
          service: true,
        },
      },
    },
  });

  // 3. team leader or co-leader under same service line
  const isServiceLineTeamLeader = ["Leader", "Coleader"].includes(
    currentUserTeam?.responsibility ?? "",
  );

  if (!isServiceManager) return false;

  if (!isServiceLineTeamLeader) return false;

  return true;
}
