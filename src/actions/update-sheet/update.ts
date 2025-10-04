"use server";

import { auth } from "@/auth";
import { canEditUpdateSheetEntry } from "@/lib/permissions/update-sheet/update-entry";
import prisma from "@/lib/prisma";
import {
  updateSheetCreateSchema,
  UpdateSheetCreateSchema,
} from "@/schemas/update-sheet/create";

export async function updateUpdateSheetEntry(
  id: string,
  values: UpdateSheetCreateSchema
) {
  // Step 1: Ensure authentication
  const session = await auth();
  if (!session || !session?.user || !session?.user.id) {
    return {
      success: false,
      message: "Authentication required. Please log in to continue.",
    };
  }

  const { user } = session;

  // Step 2: Permission check (centralized in helper)
  const { canEdit, reason } = await canEditUpdateSheetEntry(
    user.id as string,
    id
  );
  if (!canEdit) {
    return {
      success: false,
      message:
        reason ?? "You are not authorized to edit this update sheet entry.",
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
    // Step 4: Check if user has explicit UPDATE_SHEET permission
    const userPermission = await prisma.permissions.findFirst({
      where: {
        userId: user.id,
        name: "UPDATE_SHEET",
      },
    });

    if (!userPermission?.isMessageCreateAllowed) {
      return {
        success: false,
        message:
          "Your account does not have permission to update entries in the update sheet.",
      };
    }

    // Step 5: Update entry
    const updatedEntry = await prisma.updateSheet.update({
      where: { id },
      data: { ...validData },
    });

    return {
      success: true,
      message: "Entry updated successfully.",
      data: updatedEntry,
    };
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error updating update sheet entry:", error);
    return {
      success: false,
      message:
        "An unexpected error occurred while updating the update sheet entry. Please try again later.",
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
