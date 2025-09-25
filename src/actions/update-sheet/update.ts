"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import {
  updateSheetCreateSchema,
  UpdateSheetCreateSchema,
} from "@/schemas/update-sheet/create";
import { Role } from "@prisma/client";

// Roles allowed to edit update sheet entries
const ALLOWED_ROLES: Role[] = ["SUPER_ADMIN", "ADMIN"];

export async function updateUpdateSheetEntry(
  id: string,
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

  // Step 2: Fetch existing entry
  const existingEntry = await prisma.updateSheet.findUnique({
    where: { id },
  });

  if (!existingEntry) {
    return {
      success: false,
      message: "Update sheet entry not found.",
    };
  }

  // Step 3: Check ownership OR role
  const canEdit =
    user.id === existingEntry.updateById ||
    (user.role && ALLOWED_ROLES.includes(user.role as Role));

  if (!canEdit) {
    return {
      success: false,
      message:
        "You do not have permission to edit this entry. Only the creator or users with SUPER_ADMIN / ADMIN role can edit.",
    };
  }

  // Step 4: Validate incoming data
  const validationResult = updateSheetCreateSchema.safeParse(values);
  if (!validationResult.success) {
    return {
      success: false,
      message: `Invalid input data: ${validationResult.error.message}`,
    };
  }

  const validData = validationResult.data;

  try {
    // Step 5: Check if user has explicit permission for update sheet operations
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
      // ⚠️ Replace with isMessageUpdateAllowed if you have a dedicated flag
      return {
        success: false,
        message: "You are not allowed to edit entries in the update sheet.",
      };
    }

    // Step 6: Update the entry
    const updatedEntry = await prisma.updateSheet.update({
      where: { id },
      data: {
        ...validData,
      },
    });

    return {
      success: true,
      message: "Update sheet entry updated successfully.",
      data: updatedEntry,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error updating update sheet entry:", error);
    return {
      success: false,
      message:
        "An unexpected error occurred while updating the update sheet entry.",
    };
  }
}

export async function markAsSent(id: string) {
  try {
    // Step 1: Authenticate the user
    const session = await auth();
    if (!session?.user) {
      return {
        success: false,
        message: "Authentication required. Please log in to continue.",
      };
    }

    const { user } = session;

    // Step 2: Fetch existing entry
    const existingEntry = await prisma.updateSheet.findUnique({
      where: { id },
      select: { id: true, tlId: true },
    });

    if (!existingEntry) {
      return {
        success: false,
        message: "Update sheet entry not found.",
      };
    }

    // Step 3: Check user permission
    const userPermission = await prisma.permissions.findFirst({
      where: {
        userId: user.id,
        name: "UPDATE_SHEET",
      },
      select: { isMessageDoneByAllowed: true },
    });

    if (!userPermission?.isMessageDoneByAllowed) {
      return {
        success: false,
        message: "You are not allowed to mark this message as sent.",
      };
    }

    // Step 4: Update
    const updated = await prisma.updateSheet.update({
      where: { id },
      data: {
        doneById: user.id,
        sendAt: new Date(),
      },
      select: { id: true, doneById: true, sendAt: true },
    });

    return {
      success: true,
      message: ` Message marked as sent.`,
      data: updated,
    };
  } catch (error) {
    console.error("markAsSent error:", error);
    return {
      success: false,
      message: "Something went wrong while marking the message as sent.",
    };
  }
}
