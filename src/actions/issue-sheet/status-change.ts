"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { IssueStatus, Role } from "@prisma/client";

const allowedRoles: Role[] = ["SUPER_ADMIN", "ADMIN", "OPERATION_MEMBER"]; // Added SUPPORT if they should be able to change status

export async function changeIssueStatusAction(
  issueId: string,
  status: IssueStatus
) {
  const session = await auth();

  // 🔒 Authentication
  if (!session || !session.user || !session.user.id) {
    return {
      success: false,
      message: "You must be logged in to change issue status.",
    };
  }

  // 🔒 Authorization
  if (!allowedRoles.includes(session.user.role as Role)) {
    return {
      success: false,
      message: "You don't have permission to change issue status.",
    };
  }

  try {
    // Check if the issue exists
    const existingIssue = await prisma.issueSheet.findUnique({
      where: { id: issueId },
    });

    if (!existingIssue) {
      return {
        success: false,
        message: "Issue not found.",
      };
    }

    // Validate that the status is a valid IssueStatus enum value
    if (!Object.values(IssueStatus).includes(status)) {
      return {
        success: false,
        message: "Invalid status value.",
      };
    }

    // ✅ Update issue status
    const updatedIssue = await prisma.issueSheet.update({
      where: { id: issueId },
      data: {
        status,
        // Optionally track who changed the status and when
        statusChangedAt: new Date(),
        statusChangedById: session.user.id as string,
      },
    });

    return {
      success: true,
      message: `Issue status changed to "${status}" successfully.`,
      data: updatedIssue,
    };
  } catch (error) {
    console.error("❌ changeIssueStatusAction error:", error);
    return {
      success: false,
      message: "Something went wrong while changing the issue status.",
    };
  }
}
