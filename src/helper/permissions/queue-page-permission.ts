import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";

interface Props {
  cuRole: Role;
  cuId: string;
  isServiceManager: boolean;
}

const salesAndAdmin = ["ADMIN", "SUPER_ADMIN", "SALES_MEMBER"] as Role[];

const operationRoles = ["OPERATION_MEMBER"] as Role[];

export async function isQueueAccess({ cuRole, cuId, isServiceManager }: Props) {
  const isSalesAndAdmin = salesAndAdmin.includes(cuRole);

  if (isSalesAndAdmin) return true;

  const isOperationRole = operationRoles.includes(cuRole);

  if (!isOperationRole) return false;

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
