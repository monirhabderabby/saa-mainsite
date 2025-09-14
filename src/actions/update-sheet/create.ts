"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import {
  updateSheetCreateSchema,
  UpdateSheetCreateSchema,
} from "@/schemas/update-sheet/create";
import { Role } from "@prisma/client";

// Roles allowed to create update sheet entries
const ALLOWED_ROLES: Role[] = ["SUPER_ADMIN", "ADMIN", "OPERATION_MEMBER"];

export async function createUpdateSheetEntries(
  values: UpdateSheetCreateSchema
) {
  // Step 1: Authenticate the user
  const session = await auth();
  if (!session?.user) {
    return {
      success: false,
      message: "Authentication required. Please log in to continue.",
    };
  }

  const { user } = session;

  // Step 2: Check if user has the required role
  if (!ALLOWED_ROLES.includes(user.role as Role)) {
    return {
      success: false,
      message:
        "Insufficient permissions. Only SUPER_ADMIN, ADMIN, or OPERATION_MEMBER can create update sheet entries.",
    };
  }

  // Step 3: Validate incoming data
  const validationResult = updateSheetCreateSchema.safeParse(values);
  if (!validationResult.success) {
    return {
      success: false,
      message: `Invalid input data: ${validationResult.error.message}`,
    };
  }

  const validData = validationResult.data;

  try {
    // Step 4: Check if user has explicit permission to create sheet entries
    const userPermission = await prisma.permissions.findFirst({
      where: {
        userId: user.id,
        name: "UPDATE_SHEET",
      },
    });

    if (!userPermission) {
      return {
        success: false,
        message:
          "You do not have any permissions assigned for update sheet operations.",
      };
    }

    if (!userPermission.isMessageCreateAllowed) {
      return {
        success: false,
        message: "You are not allowed to add entries to the update sheet.",
      };
    }

    // Step 5: Create the update sheet entry
    const newUpdateSheetEntry = await prisma.updateSheet.create({
      data: {
        ...validData,
        updateById: user.id as string,
        tlId: null,
        doneById: null,
      },
    });

    if (!newUpdateSheetEntry) {
      return {
        success: false,
        message:
          "Failed to create the update sheet entry. Please try again later.",
      };
    }

    // Step 6: Return success response
    return {
      success: true,
      message: "Update sheet entry created successfully.",
      data: newUpdateSheetEntry,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    // Step 7: Handle unexpected errors
    console.error("Error creating update sheet entry:", error);
    return {
      success: false,
      message:
        "An unexpected error occurred while creating the update sheet entry.",
    };
  }
}
