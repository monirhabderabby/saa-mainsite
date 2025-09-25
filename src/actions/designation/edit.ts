"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import {
  designationSchema,
  DesignationSchemaType,
} from "@/schemas/designation";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";

const allowedRoles = ["SUPER_ADMIN"] as Role[];

interface EditDesignationInput extends DesignationSchemaType {
  id: string;
}

export async function editDesignationAction(data: EditDesignationInput) {
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
        message: "You don't have permission to edit a designation.",
      };
    }

    // ✅ Validate input
    const parsedData = designationSchema.safeParse(data);
    if (!parsedData.success) {
      return {
        success: false,
        message: parsedData.error.message || "Invalid input.",
      };
    }

    const { id, name, serviceId } = data;

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

    // 🔍 Check for duplicate (exclude current designation)
    const duplicate = await prisma.designations.findFirst({
      where: {
        name,
        serviceId,
        NOT: { id },
      },
    });

    if (duplicate) {
      return {
        success: false,
        message:
          "A designation with this name already exists for the selected service.",
      };
    }

    // ✏️ Update designation
    const updatedDesignation = await prisma.designations.update({
      where: { id },
      data: {
        name,
        serviceId,
      },
    });

    // 🔄 Revalidate path
    revalidatePath(`/services`);

    return {
      success: true,
      message: "Designation updated successfully.",
      data: updatedDesignation,
    };
  } catch (error) {
    console.error("❌ editDesignationAction error:", error);
    return {
      success: false,
      message: "Something went wrong while editing the designation.",
    };
  }
}
