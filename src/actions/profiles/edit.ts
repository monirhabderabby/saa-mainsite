"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { profileSchema } from "@/schemas/profile";
import { SerivceSchemaType } from "@/schemas/services";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";

const allowedRoles = ["SUPER_ADMIN"] as Role[];

export async function editProfile(id: string, data: SerivceSchemaType) {
  try {
    const session = await auth();

    // Authentication check
    if (!session || !session.user) {
      return {
        success: false,
        message: "You must be logged in to perform this action.",
      };
    }

    // Authorization check
    if (!allowedRoles.includes(session.user.role as Role)) {
      return {
        success: false,
        message:
          "You don't have permission to edit profile. Required role: SUPER_ADMIN",
      };
    }

    // Data validation
    const parsedData = profileSchema.safeParse(data);
    if (!parsedData.success) {
      return {
        success: false,
        message: parsedData.error.message,
      };
    }

    // Check if service exists
    const existingProfile = await prisma.profile.findUnique({
      where: { id },
    });

    if (!existingProfile) {
      return {
        success: false,
        message: "The requested profile was not found.",
      };
    }

    // Check for duplicate name (excluding the current service)
    const duplicateService = await prisma.profile.findFirst({
      where: {
        name: parsedData.data.name,
        NOT: { id },
      },
    });

    if (duplicateService) {
      return {
        success: false,
        message: `A profile named "${parsedData.data.name}" already exists.`,
      };
    }

    // Update the service
    const updatedService = await prisma.profile.update({
      where: { id },
      data: {
        name: parsedData.data.name,
        // Add other fields from your schema as needed
        // description: parsedData.data.description,
        // price: parsedData.data.price,
        // duration: parsedData.data.duration,
      },
    });

    // Revalidate relevant paths
    revalidatePath("/profiles");

    return {
      success: true,
      message: `Profile "${updatedService.name}" was updated successfully.`,
      data: updatedService,
    };
  } catch (error) {
    console.error("Failed to edit profile:", error);
    return {
      success: false,
      message:
        "An unexpected error occurred while updating the profile. Please try again later.",
    };
  }
}
