"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { addManagerSchema, AddManagerSchemaType } from "@/schemas/services";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";

const allowedRoles = ["SUPER_ADMIN", "ADMIN"] as Role[];

export async function AddManagerAction(data: AddManagerSchemaType) {
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
      message: "You don't have permission to add a manager to a service.",
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

    // 2. Check if the user exists
    const manager = await prisma.user.findUnique({
      where: { id: serviceManagerId },
    });

    if (!manager) {
      return {
        success: false,
        message: "User not found.",
      };
    }

    // 3. Check if user is already a manager of another service
    const alreadyManager = await prisma.services.findFirst({
      where: {
        serviceManagerId: serviceManagerId,
        NOT: { id: serviceId }, // ignore if they are already managing this same service
      },
    });

    if (alreadyManager) {
      return {
        success: false,
        message: "This user is already managing another service.",
      };
    }

    // 4. Assign the manager to the service
    await prisma.services.update({
      where: { id: serviceId },
      data: {
        serviceManagerId: serviceManagerId,
      },
    });

    // ✅ Revalidate path
    revalidatePath(`/teams`);

    return {
      success: true,
      message: `Successfully assigned ${manager.fullName ?? "the user"} as manager of the service.`,
    };
  } catch (error) {
    console.error("❌ AddManagerAction error:", error);
    return {
      success: false,
      message: "Something went wrong while assigning the manager.",
    };
  }
}
