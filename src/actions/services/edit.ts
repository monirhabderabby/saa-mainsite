"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { SerivceSchemaType, serviceSchema } from "@/schemas/services";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";

const allowedRoles = ["SUPER_ADMIN", "ADMIN"] as Role[];

export async function editService(id: string, data: SerivceSchemaType) {
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
          "You don't have permission to edit services. Required role: SUPER_ADMIN or ADMIN.",
      };
    }

    // Data validation
    const parsedData = serviceSchema.safeParse(data);
    if (!parsedData.success) {
      return {
        success: false,
        message: parsedData.error.message,
      };
    }

    // Check if service exists
    const existingService = await prisma.services.findUnique({
      where: { id },
    });

    if (!existingService) {
      return {
        success: false,
        message: "The requested service was not found.",
      };
    }

    // Check for duplicate name (excluding the current service)
    const duplicateService = await prisma.services.findFirst({
      where: {
        name: parsedData.data.name,
        departmentId: parsedData.data.departmentId, // ✅ check within same department
        NOT: { id },
      },
    });

    if (duplicateService) {
      return {
        success: false,
        message: `A service named "${parsedData.data.name}" already exists in this department.`,
      };
    }

    // Update the service
    const updatedService = await prisma.services.update({
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
    revalidatePath("/services");

    return {
      success: true,
      message: `Service "${updatedService.name}" was updated successfully.`,
      data: updatedService,
    };
  } catch (error) {
    console.error("Failed to edit service:", error);
    return {
      success: false,
      message:
        "An unexpected error occurred while updating the service. Please try again later.",
    };
  }
}
