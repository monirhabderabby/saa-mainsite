"use client";

import { changeAccountRole } from "@/actions/user/role-change";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserWithAllIncludes } from "@/types/user";
import { Role } from "@prisma/client";
import { useState, useTransition } from "react";
import { toast } from "sonner";

interface Props {
  data: UserWithAllIncludes;
}

export const allowedRoles = [
  { id: Role.OPERATION_MEMBER, name: "Operation" },
  { id: Role.SALES_MEMBER, name: "Sales" },
  { id: Role.SUPER_ADMIN, name: "Super Admin" },
  { id: Role.ADMIN, name: "Admin" },
];

const RoleManagement = ({ data }: Props) => {
  const [pending, startTransition] = useTransition();
  const [selectedRole, setSelectedRole] = useState<Role>(data.role);

  const onRoleChange = (value: Role) => {
    const prevRole = selectedRole; // backup old role
    setSelectedRole(value); // optimistic update

    startTransition(() => {
      changeAccountRole({
        userId: data.id,
        updatedRole: value,
      }).then((res) => {
        if (!res.success) {
          // revert if failed
          setSelectedRole(prevRole);
          toast.error(res.message);
          return;
        }

        toast.success(res.message);
      });
    });
  };

  return (
    <Select
      value={selectedRole}
      onValueChange={onRoleChange}
      disabled={pending}
    >
      <SelectTrigger className="shadow-none w-[150px]">
        <SelectValue placeholder="Select role" className="shadow-none" />
      </SelectTrigger>
      <SelectContent>
        {allowedRoles.map((item) => (
          <SelectItem key={item.id} value={item.id}>
            {item.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default RoleManagement;
