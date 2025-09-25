import { Role } from "@prisma/client";

export function canEditUpdateSheet({
  currentUser,
  entry,
  hasTLCheckPermission,
}: {
  currentUser: { id: string; role: Role };
  entry: {
    updateById: string;
    updateBy?: {
      serviceId?: string | null;
      service?: {
        id: string;
        serviceManagerId: string | null;
      } | null;
    } | null;
  };
  hasTLCheckPermission?: boolean;
}): boolean {
  const isOwner = currentUser.id === entry.updateById;
  const isAdmin =
    currentUser.role && ["SUPER_ADMIN", "ADMIN"].includes(currentUser.role);

  // ✅ only allow if the creator has a service and the current user is manager of that exact service
  const isServiceManager =
    entry.updateBy?.service?.id &&
    entry.updateBy?.service?.serviceManagerId === currentUser.id;

  const hasPermission = hasTLCheckPermission ?? false;

  return isOwner || isAdmin || isServiceManager || hasPermission;
}
