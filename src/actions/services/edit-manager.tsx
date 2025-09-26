"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { addManagerSchema, AddManagerSchemaType } from "@/schemas/services";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";

const allowedRoles = ["SUPER_ADMIN", "ADMIN"] as Role[];

export async function editManagerAction(data: AddManagerSchemaType) {
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
      message: "You don't have permission to edit a manager of a service.",
    };
  }

  // ✅ Validate incoming data
  const parsedData = addManagerSchema.safeParse(data);
  if (!parsedData.success) {
    return {
      success: false,
      message: parsedData.error.message,
    };
  }

  const { serviceId, serviceManagerId } = parsedData.data;

  try {
    // 1. Check if the service exists
    const service = await prisma.services.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return {
        success: false,
        message: "Service not found.",
      };
    }

    // 2. Check if the new manager exists
    const manager = await prisma.user.findUnique({
      where: { id: serviceManagerId },
    });

    if (!manager) {
      return {
        success: false,
        message: "User not found.",
      };
    }

    // 4. Update the manager of the service
    await prisma.services.update({
      where: { id: serviceId },
      data: {
        serviceManagerId,
      },
    });

    // ✅ Revalidate path
    revalidatePath(`/teams`);
    revalidatePath(`/teams/${serviceId}`);

    return {
      success: true,
      message: `Successfully updated manager to ${manager.fullName ?? "the user"} for this service.`,
    };
  } catch (error) {
    console.error("❌ EditManagerAction error:", error);
    return {
      success: false,
      message: "Something went wrong while updating the manager.",
    };
  }
}
