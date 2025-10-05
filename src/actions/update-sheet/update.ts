"use server";

import { auth } from "@/auth";
import { canEditUpdateSheetEntry } from "@/lib/permissions/update-sheet/update-entry";
import prisma from "@/lib/prisma";
import {
  updateSheetCreateSchema,
  UpdateSheetCreateSchema,
} from "@/schemas/update-sheet/create";

/**
 * Updates an existing entry in the Update Sheet.
 *
 * This function:
 * 1. Ensures the user is authenticated.
 * 2. Verifies that the user has permission to edit the specified Update Sheet entry.
 * 3. Validates the provided input data against the schema.
 * 4. Checks if the user has explicit `UPDATE_SHEET` permission for creating or updating messages.
 * 5. Updates the entry in the database if all checks pass.
 *
 * @param id - The ID of the Update Sheet entry to be updated.
 * @param values - The new data to update, validated by `updateSheetCreateSchema`.
 * @returns An object containing `success`, `message`, and optionally the updated entry data.
 */
export async function updateUpdateSheetEntry(
  id: string,
  values: UpdateSheetCreateSchema
) {
  // Step 1: Ensure authentication
  // ----------------------------------------------------------------
  // The function first ensures the user is logged in and has a valid session.
  // If not authenticated, return an error response immediately.
  const session = await auth();
  if (!session || !session?.user || !session?.user.id) {
    return {
      success: false,
      message: "Authentication required. Please log in to continue.",
    };
  }

  const { user } = session;

  // Step 2: Check edit permissions for this specific entry
  // ----------------------------------------------------------------
  // This uses a centralized helper `canEditUpdateSheetEntry` to determine whether
  // the current user has permission to modify this entry (based on their role,
  // service line, or assigned team responsibilities).
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
  // ----------------------------------------------------------------
  // Validate the input values against the `updateSheetCreateSchema`.
  // If validation fails, respond with an error containing details of the issue.
  const validationResult = updateSheetCreateSchema.safeParse(values);
  if (!validationResult.success) {
    return {
      success: false,
      message: `Invalid input data: ${validationResult.error.message}`,
    };
  }

  const validData = validationResult.data;

  try {
    // Step 4: Check explicit UPDATE_SHEET permission
    // ----------------------------------------------------------------
    // Even if the user passes the role-based checks, they must also have
    // explicit permission (from the permissions table) to perform this action.
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

    // Step 5: Perform the database update
    // ----------------------------------------------------------------
    // Once all validations and permissions are confirmed, the Update Sheet
    // entry is updated with the new validated data.
    const updatedEntry = await prisma.updateSheet.update({
      where: { id },
      data: { ...validData },
    });

    return {
      success: true,
      message: "Entry updated successfully.",
      data: updatedEntry,
    };
  } catch (error) {
    // Step 6: Handle unexpected errors
    // ----------------------------------------------------------------
    // Catch any runtime or database errors and return a user-friendly message.
    console.error("Error updating update sheet entry:", error);
    return {
      success: false,
      message:
        "An unexpected error occurred while updating the update sheet entry. Please try again later.",
    };
  }
}
