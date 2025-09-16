"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { issueSheetSchema, IssueSheetSchemaType } from "@/schemas/issue-sheet";
import { Role } from "@prisma/client";

const allowedRoles: Role[] = ["SUPER_ADMIN", "ADMIN"];

export async function createIssueAction(data: IssueSheetSchemaType) {
  const session = await auth();

  // 🔒 Authentication
  if (!session || !session.user) {
    return {
      success: false,
      message: "You must be logged in to create an issue.",
    };
  }

  // 🔒 Authorization
  if (!allowedRoles.includes(session.user.role as Role)) {
    return {
      success: false,
      message: "You don't have permission to create an issue.",
    };
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
