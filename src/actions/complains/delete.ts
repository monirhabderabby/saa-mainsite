// actions/complaint.ts  (add alongside createComplaintAction)
"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteComplaintAction(complaintId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, message: "Unauthorized" };
  }

  try {
    const complaint = await prisma.complaint.findUnique({
      where: { id: complaintId },
      select: { creatorId: true },
    });

    if (!complaint) {
      return { success: false, message: "Complaint not found." };
    }

    if (complaint.creatorId !== session.user.id) {
      return {
        success: false,
        message: "You are not allowed to delete this complaint.",
      };
    }

    await prisma.complaint.delete({ where: { id: complaintId } });

    revalidatePath("/complains");
    return { success: true, message: "Complaint deleted successfully." };
  } catch (error) {
    console.error("❌ deleteComplaintAction error:", error);
    return { success: false, message: "Something went wrong while deleting." };
  }
}
