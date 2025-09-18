"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { issueSheetSchema, IssueSheetSchemaType } from "@/schemas/issue-sheet";
import { Role } from "@prisma/client";

const allowedRoles: Role[] = ["SUPER_ADMIN", "ADMIN"];

export async function createIssueAction(data: IssueSheetSchemaType) {
  const session = await auth();

  // 🔒 Authentication
  if (!session || !session.user || !session.user.id) {
    return {
      success: false,
      message: "You must be logged in to create an issue.",
    };
  }

  const userRole = session.user.role as Role;

  // ✅ If super admin or admin → skip permission check
  if (!allowedRoles.includes(userRole)) {
    const permission = await prisma.permissions.findFirst({
      where: {
        name: "ISSUE_SHEET",
        userId: session.user.id, // optional: enforce per-user permissions
      },
      select: {
        isIssueCreateAllowed: true,
      },
    });

    if (!permission || !permission.isIssueCreateAllowed) {
      return {
        success: false,
        message:
          "You are not allowed to raise issues in the sheets at this time.",
      };
    }
  }

  try {
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

    // ✅ Create issue
    const issue = await prisma.issueSheet.create({
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
        creatorId: session.user.id as string,
      },
    });

    return {
      success: true,
      message: `Issue of client "${issue.clientName}" created successfully.`,
      data: issue,
    };
  } catch (error) {
    console.error("❌ createIssueAction error:", error);
    return {
      success: false,
      message: "Something went wrong while creating the issue.",
    };
  }
}
