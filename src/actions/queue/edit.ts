"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function editQueueAction(input: {
  queueId: string;
  profileId: string;
  clientName: string;
  orderId?: string;
  message: string;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, message: "Unauthorized." };
  }

  const { queueId, profileId, clientName, orderId, message } = input;

  if (!profileId?.trim()) {
    return { success: false, message: "Profile ID is required." };
  }
  if (!clientName?.trim()) {
    return { success: false, message: "Client name is required." };
  }
  if (!message?.trim()) {
    return { success: false, message: "Message is required." };
  }

  try {
    const queue = await prisma.queue.findUnique({
      where: { id: queueId },
      select: { requestedById: true, status: true },
    });

    if (!queue) {
      return { success: false, message: "Queue not found." };
    }

    if (queue.requestedById !== session.user.id) {
      return {
        success: false,
        message: "You are not allowed to edit this queue.",
      };
    }

    if (queue.status !== "REQUESTED") {
      return {
        success: false,
        message: "Only queues with status 'Requested' can be edited.",
      };
    }

    const result = await prisma.queue.update({
      where: { id: queueId },
      data: {
        profileId: profileId.trim(),
        clientName: clientName.trim(),
        orderId: orderId?.trim() || null,
        message: message.trim(),
      },
      include: {
        requestedBy: true,
        assignedTo: true,
        links: true,
        profile: true,
      },
    });

    revalidatePath("/dashboard/queue");
    return {
      success: true,
      message: "Queue updated successfully.",
      data: result,
    };
  } catch (error) {
    console.error("❌ editQueueAction error:", error);
    return {
      success: false,
      message: "Something went wrong while updating the queue.",
    };
  }
}
