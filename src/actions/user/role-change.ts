"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";

interface UpdateProps {
  userId: string;
  updatedRole: Role;
}

const allowedToPermission: Role[] = ["SUPER_ADMIN"];

export async function changeAccountRole({ userId, updatedRole }: UpdateProps) {
  try {
    const session = await auth();

    // ✅ Authentication check
    if (!session || !session.user) {
      return {
        success: false,
        message: "You must be logged in to perform this action.",
      };
    }

    const currentUserRole = session.user.role as Role;
    const currentUserId = session.user.id;

    // ✅ Authorization check
    if (!allowedToPermission.includes(currentUserRole)) {
      return {
        success: false,
        message:
          "You don't have permission to update roles. Required role: SUPER_ADMIN.",
      };
    }

    // ✅ Prevent self-role modification (optional but safer)
    if (userId === currentUserId) {
      return {
        success: false,
        message: "You cannot change your own role.",
      };
    }

    // ✅ Check if user exists
    const existUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existUser) {
      return {
        success: false,
        message: "The specified user does not exist.",
      };
    }

    // ✅ Prevent redundant updates
    if (existUser.role === updatedRole) {
      return {
        success: false,
        message: `The user already has the role "${updatedRole}".`,
      };
    }

    // ✅ Update role
    await prisma.user.update({
      where: { id: userId },
      data: { role: updatedRole },
    });

    return {
      success: true,
      message: `User "${existUser.email}" role updated from "${existUser.role}" to "${updatedRole}".`,
    };
  } catch (error) {
    console.error("Error updating account role:", error);
    return {
      success: false,
      message: "An unexpected error occurred while updating the role.",
    };
  }
}
