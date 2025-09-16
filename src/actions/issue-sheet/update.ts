"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { issueSheetSchema, IssueSheetSchemaType } from "@/schemas/issue-sheet";
import { Role } from "@prisma/client";

const allowedRoles: Role[] = ["SUPER_ADMIN", "ADMIN"];

export async function editIssueAction(id: string, data: IssueSheetSchemaType) {
  const session = await auth();

  // 🔒 Authentication
  if (!session || !session.user || !session.user.id) {
    return {
      success: false,
      message: "You must be logged in to edit an issue.",
    };
  }

  // 🔒 Authorization
  if (!allowedRoles.includes(session.user.role as Role)) {
    return {
      success: false,
      message: "You don't have permission to edit an issue.",
    };
  }

  const permission = await prisma.permissions.findFirst({
    where: {
      name: "ISSUE_SHEET",
    },
    select: {
      isIssueUpdatAllowed: true,
    },
  });

  // Check if permission exists
  if (!permission) {
    return {
      success: false,
      message: "Permission for issue sheet not found. Contact admin.",
    };
  }

  // Check if editing is allowed
  if (!permission.isIssueUpdatAllowed) {
    return {
      success: false,
      message: "You do not have permission to edit issue sheets.",
    };
  }

  try {
    // Check if the issue exists
    const existingIssue = await prisma.issueSheet.findUnique({
      where: { id },
    });

    if (!existingIssue) {
      return {
        success: false,
        message: "Issue not found.",
      };
    }

    // ✅ Validate data
    const parsed = issueSheetSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.message,
      };
    }

    const {
      clientName,
      orderId,
      profileId,
      serviceId,
      orderPageUrl,
      inboxPageUrl,
      specialNotes,
      noteForSales,
      fileOrMeetingLink,
    } = parsed.data;

    // ✅ Update issue
    const updatedIssue = await prisma.issueSheet.update({
      where: { id },
      data: {
        clientName,
        orderId,
        profileId,
        serviceId,
        orderPageUrl: orderPageUrl || null,
        inboxPageUrl: inboxPageUrl || null,
        specialNotes: specialNotes || null,
        noteForSales: noteForSales || null,
        fileOrMeetingLink: fileOrMeetingLink || null,
        // Optionally track who last modified the issue
        // updatedById: session.user.id as string,
      },
    });

    return {
      success: true,
      message: `Issue of client "${updatedIssue.clientName}" updated successfully.`,
      data: updatedIssue,
    };
  } catch (error) {
    console.error("❌ editIssueAction error:", error);
    return {
      success: false,
      message: "Something went wrong while updating the issue.",
    };
  }
}
