"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { generateUniqueIdForComplain } from "@/lib/utils";
import { complaintSchema, ComplaintSchemaType } from "@/schemas/complaint";
import { revalidatePath } from "next/cache";

export async function createComplaintAction(data: ComplaintSchemaType) {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return {
      success: false,
      message: "You must be logged in to submit a complaint.",
    };
  }

  const uniqueId = await generateUniqueIdForComplain("SC");

  try {
    const parsed = complaintSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        message: "Invalid form data.",
      };
    }

    const { subject, priority, message, supportingDocs } = parsed.data;

    const complaint = await prisma.complaint.create({
      data: {
        subject,
        uniqueId: uniqueId,
        priority,
        message,
        supportingDocs: supportingDocs
          ? supportingDocs
              .map((doc) => doc.value)
              .filter((v) => v.trim() !== "")
          : [],
        creatorId: session.user.id,
      },
    });

    revalidatePath("/complains");

    return {
      success: true,
      message:
        "Your complaint has been submitted successfully. Management will review it within 72 hours.",
      data: complaint,
    };
  } catch (error) {
    console.error("❌ createComplaintAction error:", error);
    return {
      success: false,
      message: "Something went wrong while submitting your complaint.",
    };
  }
}
