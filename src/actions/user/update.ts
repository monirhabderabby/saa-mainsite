"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { PermissionField } from "@/types/user";
import { AccountStatus, Role } from "@prisma/client";
import { revalidatePath } from "next/cache";

interface Props {
  accountStatus: AccountStatus;
  id: string;
}

const allowedToUpdate = ["ADMIN", "SUPER_ADMIN"] as Role[];

export async function statusUpdate({ id, accountStatus }: Props) {
  const session = await auth();

  // Authentication check
  if (!session || !session.user) {
    return {
      success: false,
      message: "You must be logged in to perform this action.",
    };
  }

  // Authorization check
  if (!allowedToUpdate.includes(session.user.role as Role)) {
    return {
      success: false,
      message:
        "You don't have permission to update account status. Required role: SUPER_ADMIN or ADMIN.",
    };
  }

  const existUser = await prisma.user.findFirst({
    where: { id },
  });

  if (!existUser) {
    return {
      success: false,
      message: "User not found.",
    };
  }

  // Role check: Prevent admins from deactivating super-admins
  if (session.user.role === "ADMIN" && existUser.role === "SUPER_ADMIN") {
    return {
      success: false,
      message: "You cannot update the status of a SUPER ADMIN.",
    };
  }

  // If account status is already the same, just ignore
  if (existUser.accountStatus === accountStatus) {
    return {
      success: true,
      message: "Account status is already up to date.",
      user: existUser,
    };
  }

  const user = await prisma.user.update({
    where: { id },
    data: { accountStatus },
  });

  revalidatePath("/employees");

  return {
    success: true,
    message: `Account status updated to ${accountStatus}.`,
    user,
  };
}

const allowedToPermission = ["ADMIN", "SUPER_ADMIN"] as Role[];

interface UpdateProps {
  id: string;
  field: PermissionField;
  value: boolean;
}
export async function updatePermission({ id, field, value }: UpdateProps) {
  const session = await auth();

  // Authentication check
  if (!session || !session.user) {
    return {
      success: false,
      message: "You must be logged in to perform this action.",
    };
  }

  // Authorization check
  if (!allowedToPermission.includes(session.user.role as Role)) {
    return {
      success: false,
      message:
        "You don't have permission to update permissions. Required role: SUPER_ADMIN or ADMIN.",
    };
  }

  // Find the permission record
  const existing = await prisma.permissions.findFirst({ where: { id } });
  if (!existing) {
    return {
      success: false,
      message: "Permission record not found.",
    };
  }

  // If already the same, ignore
  if (existing[field] === value) {
    return {
      success: true,
      message: "Permission already up to date.",
      permission: existing,
    };
  }

  // Update permission
  const permission = await prisma.permissions.update({
    where: { id },
    data: {
      [field]: value,
      updatedAt: new Date(),
    },
  });

  return {
    success: true,
    message: `Permission "${field}" updated to ${value}.`,
    permission,
  };
}
