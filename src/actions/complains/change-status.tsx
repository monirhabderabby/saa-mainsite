"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { ComplaintStatus, Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// 🔐 Allowed roles (adjust if needed)
const allowedRoles = ["SUPER_ADMIN", "ADMIN", "OPERATION_MEMBER"] as Role[];

// ✅ Validation schema
const changeStatusSchema = z.object({
  complaintId: z.string().min(1, "Complaint ID is required"),
  status: z.nativeEnum(ComplaintStatus),
});

type ChangeStatusSchemaType = z.infer<typeof changeStatusSchema>;

export async function changeComplaintStatusAction(
  data: ChangeStatusSchemaType,
) {
  try {
    const session = await auth();

    // 🔒 Authentication check
    if (!session || !session.user) {
      return {
        success: false,
        message: "You must be logged in to perform this action.",
      };
    }

    // 🔒 Authorization check
    if (!allowedRoles.includes(session.user.role as Role)) {
      return {
        success: false,
        message: "You don't have permission to change complaint status.",
      };
    }

    // ✅ Validate input
    const parsedData = changeStatusSchema.safeParse(data);
    if (!parsedData.success) {
      return {
        success: false,
        message: parsedData.error.message || "Invalid input.",
      };
    }

    const { complaintId, status } = parsedData.data;

    // 🔍 Check if complaint exists
    const complaint = await prisma.complaint.findUnique({
      where: { id: complaintId },
    });

    if (!complaint) {
      return {
        success: false,
        message: "Complaint not found.",
      };
    }

    // ⚠️ Optional: Prevent updating if already resolved/rejected
    if (complaint.status === "RESOLVED" || complaint.status === "REJECTED") {
      return {
        success: false,
        message: "Cannot update status of a resolved or rejected complaint.",
      };
    }

    // 🔄 Update status
    const updatedComplaint = await prisma.complaint.update({
      where: { id: complaintId },
      data: { status },
    });

    // 🔄 Revalidate relevant paths
    revalidatePath("/complaints");

    return {
      success: true,
      message: "Complaint status updated successfully.",
      data: updatedComplaint,
    };
  } catch (error) {
    console.error("❌ changeComplaintStatusAction error:", error);
    return {
      success: false,
      message: "Something went wrong while updating complaint status.",
    };
  }
}
