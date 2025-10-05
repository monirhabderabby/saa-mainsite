"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { issueSheetSchema, IssueSheetSchemaType } from "@/schemas/issue-sheet";
import { Role } from "@prisma/client";

const ALLOWED_ROLES: Role[] = ["SUPER_ADMIN", "ADMIN"];

/**
 * Updates an existing Issue Sheet entry.
 *
 * Authorization rules:
 * - ✅ SUPER_ADMIN and ADMIN can always edit.
 * - ✅ Non-admin users can edit only if they have the ISSUE_SHEET permission with `isIssueUpdatAllowed = true`.
 */
export async function editIssueAction(id: string, data: IssueSheetSchemaType) {
  const session = await auth();

  // 🔒 Step 1: Authentication
  if (!session?.user?.id) {
    return {
      success: false,
      message: "You must be logged in to edit an issue.",
    };
  }

  const { user } = session;

  // 🔒 Step 2: Fetch user-specific ISSUE_SHEET permission
  const userPermission = await prisma.permissions.findFirst({
    where: {
      userId: user.id, // ✅ Check permission for the logged-in user
      name: "ISSUE_SHEET",
    },
    select: {
      isIssueUpdatAllowed: true,
    },
  });

  // 🔒 Step 3: Determine if user is allowed
  const isAdmin = ALLOWED_ROLES.includes(user.role as Role);
  const hasPermission = userPermission?.isIssueUpdatAllowed === true;

  if (!isAdmin && !hasPermission) {
    return {
      success: false,
      message:
        "You don't have permission to edit issue sheets. Contact your administrator.",
    };
  }

  try {
    // Step 4: Ensure the issue exists
    const existingIssue = await prisma.issueSheet.findUnique({
      where: { id },
    });

    if (!existingIssue) {
      return {
        success: false,
        message: "Issue not found.",
      };
    }

    // Step 5: Validate incoming data
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

    // Step 6: Update issue
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
        // updatedById: user.id,
      },
    });

    return {
      success: true,
      message: `Issue for client "${updatedIssue.clientName}" updated successfully.`,
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
