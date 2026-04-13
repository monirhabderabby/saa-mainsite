"use server";

import { auth } from "@/auth";
import { getSalesMembersForProfile } from "@/helper/notification/notification-helpers";
import prisma from "@/lib/prisma";
import { getUserChannel, PUSHER_EVENTS } from "@/lib/pusher/constants";
import pusherServer from "@/lib/pusher/pusher";
import {
  updateSheetCreateSchema,
  UpdateSheetCreateSchema,
} from "@/schemas/update-sheet/create";
import { UpdateSheetNotificationPayload } from "@/types/notification/notifications";
import { Role } from "@prisma/client";
import { logUpdateActivity } from "./activity";

// Roles allowed to create update sheet entries
const ALLOWED_ROLES: Role[] = ["SUPER_ADMIN", "ADMIN", "OPERATION_MEMBER"];
const PROJECT_NEXT_UPDATE_DAYS = 2;

export async function createUpdateSheetEntries(
  values: UpdateSheetCreateSchema,
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

    const currentUsers = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
      select: {
        serviceId: true,
        userTeams: {
          select: {
            teamId: true,
          },
        },
      },
    });

    if (!currentUsers) {
      return {
        success: false,
        message:
          "You are not assigned to any team. Please contact an administrator.",
      };
    }

    const teamId = currentUsers.userTeams[0]?.teamId;
    const serviceId = currentUsers.serviceId;

    if (!serviceId) {
      return {
        success: false,
        message:
          "Unable to create entry because your service association is missing.",
      };
    }

    // Step 5: Create the update sheet entry
    const newUpdateSheetEntry = await prisma.updateSheet.create({
      data: {
        ...validData,
        updateById: user.id as string,
        tlId: null,
        doneById: null,
        tlCheckAt: null,
        updatedAt: new Date(),
        teamId,
        serviceId,
      },
      include: {
        profile: true,
      },
    });

    if (!newUpdateSheetEntry) {
      return {
        success: false,
        message:
          "Failed to create the update sheet entry. Please try again later.",
      };
    }

    // Step 6: Log activity
    await logUpdateActivity({
      updateSheetId: newUpdateSheetEntry.id,
      actorId: user.id as string,
      type: "ENTRY_CREATED",
    });

    // Step 6.5: Update associated project dates (non-blocking)
    if (newUpdateSheetEntry.updateTo !== "DELIVERY") {
      await updateProjectDates(newUpdateSheetEntry.orderId);
    }

    // Notification
    const salesMemberIds = await getSalesMembersForProfile(
      newUpdateSheetEntry.profileId,
    );

    if (salesMemberIds.length > 0) {
      const payload: UpdateSheetNotificationPayload = {
        type: "UPDATE_SHEET_CREATED",
        updateSheetId: newUpdateSheetEntry.id,
        clientName: newUpdateSheetEntry.clientName,
        orderId: newUpdateSheetEntry.orderId,
        profileName: newUpdateSheetEntry.profile.name,
        profileId: newUpdateSheetEntry.profileId,
        createdBy: session.user.name ?? "Someone",

        createdAt: newUpdateSheetEntry.createdAt.toISOString(),
      };

      await Promise.all(
        salesMemberIds.map((userId) =>
          pusherServer.trigger(
            getUserChannel(userId),
            PUSHER_EVENTS.UPDATE_SHEET_CREATED,
            payload,
          ),
        ),
      );
    }

    // Step 7: Return success response
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

/**
 * Updates the associated FSD project dates
 */
async function updateProjectDates(orderId: string) {
  try {
    const existingProject = await prisma.project.findUnique({
      where: { orderId },
      select: { id: true },
    });

    if (existingProject) {
      const now = new Date();
      const nextUpdateDate = new Date(now);
      nextUpdateDate.setDate(now.getDate() + PROJECT_NEXT_UPDATE_DAYS);

      await prisma.project.update({
        where: { orderId },
        data: {
          lastUpdate: now,
          nextUpdate: nextUpdateDate,
        },
      });
    }
  } catch (error) {
    // Log the error but don't fail the entire operation
    console.error("Error updating project dates:", error);
  }
}
