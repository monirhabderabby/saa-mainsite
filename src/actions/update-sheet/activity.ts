"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { UpdateActivityType, Prisma } from "@prisma/client";

/**
 * Adds a comment activity to an update sheet.
 */
export async function addUpdateComment(
  updateSheetId: string,
  content: string
) {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      message: "You must be logged in to add a comment.",
    };
  }

  if (!content || content.trim().length === 0) {
    return {
      success: false,
      message: "Comment cannot be empty.",
    };
  }

  try {
    const activity = await prisma.updateActivity.create({
      data: {
        type: UpdateActivityType.COMMENT,
        content: content.trim(),
        updateSheetId,
        actorId: session.user.id,
      },
      include: {
        actor: {
          select: {
            fullName: true,
            nickName: true,
            image: true,
          },
        },
      },
    });

    // Note: Not calling revalidatePath here because it would re-render the page
    // and close the activity modal. The panel re-fetches activities manually.

    return {
      success: true,
      message: "Comment added successfully.",
      data: activity,
    };
  } catch (error) {
    console.error("❌ addUpdateComment error:", error);
    return {
      success: false,
      message: "Something went wrong while adding the comment.",
    };
  }
}

/**
 * Fetches all activities for a given update sheet.
 */
export async function getUpdateActivities(updateSheetId: string) {
  try {
    const activities = await prisma.updateActivity.findMany({
      where: { updateSheetId },
      include: {
        actor: {
          select: {
            fullName: true,
            nickName: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: activities,
    };
  } catch (error) {
    console.error("❌ getUpdateActivities error:", error);
    return {
      success: false,
      data: [],
      message: "Failed to load activities.",
    };
  }
}

/**
 * Helper to log system activities (called internally from other server actions).
 * Not a server action itself — it's called from within other server actions.
 */
export async function logUpdateActivity({
  updateSheetId,
  actorId,
  type,
  content,
  meta,
}: {
  updateSheetId: string;
  actorId: string;
  type: UpdateActivityType;
  content?: string;
  meta?: Prisma.InputJsonValue;
}) {
  try {
    await prisma.updateActivity.create({
      data: {
        type,
        content: content || null,
        meta: meta || null,
        updateSheetId,
        actorId,
      },
    });
  } catch (error) {
    // Don't fail the main operation if logging fails
    console.error("❌ logUpdateActivity error:", error);
  }
}
