"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { IssueActivityType, Prisma } from "@prisma/client";

/**
 * Adds a comment activity to an issue sheet.
 */
export async function addIssueComment(
  issueSheetId: string,
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
    const activity = await prisma.issueActivity.create({
      data: {
        type: IssueActivityType.COMMENT,
        content: content.trim(),
        issueSheetId,
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
    // and close the issue view modal. The panel re-fetches activities manually.

    return {
      success: true,
      message: "Comment added successfully.",
      data: activity,
    };
  } catch (error) {
    console.error("❌ addIssueComment error:", error);
    return {
      success: false,
      message: "Something went wrong while adding the comment.",
    };
  }
}

/**
 * Fetches all activities for a given issue sheet.
 */
export async function getIssueActivities(issueSheetId: string) {
  try {
    const activities = await prisma.issueActivity.findMany({
      where: { issueSheetId },
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
    console.error("❌ getIssueActivities error:", error);
    return {
      success: false,
      data: [],
      message: "Failed to load activities.",
    };
  }
}

/**
 * Helper to log system activities (called internally from other actions).
 * Not a server action itself — it's called from within other server actions.
 */
export async function logIssueActivity({
  issueSheetId,
  actorId,
  type,
  content,
  meta,
}: {
  issueSheetId: string;
  actorId: string;
  type: IssueActivityType;
  content?: string;
  meta?: Prisma.InputJsonValue;
}) {
  try {
    await prisma.issueActivity.create({
      data: {
        type,
        content: content || null,
        meta: meta || null,
        issueSheetId,
        actorId,
      },
    });
  } catch (error) {
    // Don't fail the main operation if logging fails
    console.error("❌ logIssueActivity error:", error);
  }
}
