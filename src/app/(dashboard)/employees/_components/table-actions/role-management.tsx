"use client";

import { Badge } from "@/components/ui/badge";
import { UserWithAllIncludes } from "@/types/user";
import { Role } from "@prisma/client";

interface Props {
  data: UserWithAllIncludes;
}

const roleStyles: Record<Role, string> = {
  [Role.OPERATION_MEMBER]: "bg-blue-100 text-blue-700 hover:bg-blue-100",
  [Role.SALES_MEMBER]: "bg-green-100 text-green-700 hover:bg-green-100",
  [Role.SUPER_ADMIN]: "bg-purple-100 text-purple-700 hover:bg-purple-100",
  [Role.ADMIN]: "bg-red-100 text-red-700 hover:bg-red-100",
};

const roleLabels: Record<Role, string> = {
  [Role.OPERATION_MEMBER]: "Operation",
  [Role.SALES_MEMBER]: "Sales",
  [Role.SUPER_ADMIN]: "Super Admin",
  [Role.ADMIN]: "Admin",
};

const RoleBadge = ({ data }: Props) => {
  return (
    <Badge className={roleStyles[data.role]}>{roleLabels[data.role]}</Badge>
  );
};

export default RoleBadge;
