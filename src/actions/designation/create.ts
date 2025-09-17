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

export async function createDesignationAction(data: DesignationSchemaType) {
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
        message: "You don't have permission to create a designation.",
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

    const { name, serviceId } = parsedData.data;

    // 🔍 Check if designation already exists under same service
    const exist = await prisma.designations.findFirst({
      where: {
        name,
        serviceId,
      },
    });

    if (exist) {
      return {
        success: false,
        message:
          "A designation with this name already exists for the selected service.",
      };
    }

    // 🆕 Create designation
    const newDesignation = await prisma.designations.create({
      data: {
        name,
        serviceId,
      },
    });

    // 🔄 Revalidate path (assuming similar path pattern as teams)
    revalidatePath(`/services`);

    return {
      success: true,
      message: "Designation created successfully.",
      data: newDesignation,
    };
  } catch (error) {
    console.error("❌ createDesignationAction error:", error);
    return {
      success: false,
      message: "Something went wrong while creating the designation.",
    };
  }
}
