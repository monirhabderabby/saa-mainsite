"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";

// Roles allowed to delete update sheet entries
const ALLOWED_ROLES: Role[] = ["SUPER_ADMIN", "ADMIN"];

export async function deleteUpdateSheetEntry(id: string) {
  // Step 1: Authenticate the user
  const session = await auth();
  if (!session?.user) {
    return {
      success: false,
      message: "Authentication required. Please log in to continue.",
    };
  }

  const { user } = session;

  try {
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
    const canDelete =
      user.id === existingEntry.updateById ||
      (user.role && ALLOWED_ROLES.includes(user.role as Role));

    if (!canDelete) {
      return {
        success: false,
        message:
          "You do not have permission to delete this entry. Only the creator or users with SUPER_ADMIN / ADMIN role can delete.",
      };
    }

    // Step 4: Check if user has explicit permission for delete operations
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
      // ⚠️ Make sure your permissions model has a dedicated delete flag
      return {
        success: false,
        message: "You are not allowed to delete entries in the update sheet.",
      };
    }

    // Step 5: Delete the entry
    await prisma.updateSheet.delete({
      where: { id },
    });

    return {
      success: true,
      message: "Update sheet entry deleted successfully.",
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error deleting update sheet entry:", error);
    return {
      success: false,
      message:
        "An unexpected error occurred while deleting the update sheet entry.",
    };
  }
}
