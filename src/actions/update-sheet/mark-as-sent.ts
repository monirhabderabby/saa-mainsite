"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";

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
      select: { id: true, tlId: true, updateTo: true },
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
      select: { id: true, doneById: true, sendAt: true, orderId: true },
    });

    // Step 5: Update project delivered
    if (existingEntry.updateTo === "DELIVERY") {
      await updateProjectDelivered(updated.orderId);
    }

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

/**
 * Updates the associated FSD project dates
 */
async function updateProjectDelivered(orderId: string) {
  try {
    const existingProject = await prisma.project.findUnique({
      where: {
        orderId,
        status: {
          not: "Delivered",
        },
      },
      select: { id: true },
    });

    if (existingProject) {
      const now = new Date();

      await prisma.project.update({
        where: { orderId },
        data: {
          status: "Delivered",
          delivered: now,
        },
      });
    }
  } catch (error) {
    // Log the error but don't fail the entire operation
    console.error("Error updating project dates:", error);
  }
}
