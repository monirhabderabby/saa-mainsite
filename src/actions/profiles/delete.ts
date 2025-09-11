"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";

const allowToDelete = ["SUPER_ADMIN"] as Role[];

export async function deleteProfile(id: string) {
  try {
    const cu = await auth();

    if (!cu || !allowToDelete.includes(cu.user.role as Role)) {
      return {
        success: false,
        message: "You do not have permission to delete profile.",
      };
    }

    const existingProfile = await prisma.profile.findUnique({
      where: { id },
    });

    if (!existingProfile) {
      return {
        success: false,
        message: "The requested service was not found.",
      };
    }

    await prisma.profile.delete({
      where: { id },
    });

    // Refresh cache where services are displayed
    revalidatePath("/profiles");

    return {
      success: true,
      message: `Profile "${existingProfile.name}" was deleted successfully.`,
    };
  } catch (error) {
    console.error("Service deletion failed:", error);
    return {
      success: false,
      message:
        "Something went wrong while deleting the service. Please try again.",
    };
  }
}
