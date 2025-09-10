"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { AccountStatus, Role } from "@prisma/client";

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

  return {
    success: true,
    message: `Account status updated to ${accountStatus}.`,
    user,
  };
}
