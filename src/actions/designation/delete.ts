"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";

const allowedRoles = ["SUPER_ADMIN"] as Role[];

export async function deleteDesignationAction(id: string) {
  try {
    const session = await auth();

    // 🔒 Authentication check
    if (!session || !session.user) {
      return {
        success: false,
        message: "You must be logged in to perform this action.",
      };
    }

    // 🔒 Authorization check
    if (!allowedRoles.includes(session.user.role as Role)) {
      return {
        success: false,
        message: "You don't have permission to delete a designation.",
      };
    }

    // 🔍 Check if designation exists
    const existingDesignation = await prisma.designations.findUnique({
      where: { id },
    });

    if (!existingDesignation) {
      return {
        success: false,
        message: "Designation not found.",
      };
    }

    // 🗑️ Delete designation
    await prisma.designations.delete({
      where: { id },
    });

    // 🔄 Revalidate path
    revalidatePath(`/services`);

    return {
      success: true,
      message: "Designation deleted successfully.",
    };
  } catch (error) {
    console.error("❌ deleteDesignationAction error:", error);
    return {
      success: false,
      message: "Something went wrong while deleting the designation.",
    };
  }
}
