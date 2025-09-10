"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";

const allowToDelete = ["SUPER_ADMIN", "ADMIN"] as Role[];

export async function deleteService(id: string) {
  try {
    const cu = await auth();

    if (!cu || !allowToDelete.includes(cu.user.role as Role)) {
      return {
        success: false,
        message: "You do not have permission to delete services.",
      };
    }

    const existingService = await prisma.services.findUnique({
      where: { id },
    });

    if (!existingService) {
      return {
        success: false,
        message: "The requested service was not found.",
      };
    }

    await prisma.services.delete({
      where: { id },
    });

    // Refresh cache where services are displayed
    revalidatePath("/dashboard/services");
    revalidatePath("/");

    return {
      success: true,
      message: `Service "${existingService.name}" was deleted successfully.`,
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
