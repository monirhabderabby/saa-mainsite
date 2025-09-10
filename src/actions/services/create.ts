"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { SerivceSchemaType, serviceSchema } from "@/schemas/services";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";

const allowedRoles = ["SUPER_ADMIN", "ADMIN"] as Role[];

export async function createService(data: SerivceSchemaType) {
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
          "You don't have permission to create services. Required role: SUPER_ADMIN or ADMIN.",
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

    // Check for duplicate service
    const existingService = await prisma.services.findFirst({
      where: {
        name: parsedData.data.name,
      },
    });

    if (existingService) {
      return {
        success: false,
        message: `A service named "${parsedData.data.name}" already exists.`,
      };
    }

    // Create the service
    const service = await prisma.services.create({
      data: {
        name: parsedData.data.name,
        // Add other fields from your service schema as needed
        // description: parsedData.data.description,
        // price: parsedData.data.price,
        // duration: parsedData.data.duration,
      },
    });

    // Revalidate relevant paths
    revalidatePath("/services");

    return {
      success: true,
      message: `Service "${parsedData.data.name}" created successfully.`,
      data: service,
    };
  } catch (error) {
    console.error("Failed to create service:", error);
    return {
      success: false,
      message:
        "An unexpected error occurred while creating the service. Please try again later.",
    };
  }
}
