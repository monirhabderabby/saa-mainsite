import { Role } from "@prisma/client";

interface Props {
  cuRole: Role;
  cuId: string;
  isServiceManager: boolean;
}

const salesAndAdmin = ["ADMIN", "SUPER_ADMIN", "SALES_MEMBER"] as Role[];

const operationRoles = ["OPERATION_MEMBER"] as Role[];

export async function isQueueAccess({ cuRole, isServiceManager }: Props) {
  const isSalesAndAdmin = salesAndAdmin.includes(cuRole);

  if (isSalesAndAdmin) return true;

  if (isServiceManager) return true;

  const isOperationRole = operationRoles.includes(cuRole);

  // Every Operation user (plain member, team leader, service manager) can
  // access and create queues.
  if (isOperationRole) return true;

  return false;
}
