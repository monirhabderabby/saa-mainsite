"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { generateUniqueIdForQueue } from "@/lib/utils";

export async function createQueueAction(input: {
  profileId: string;
  clientName: string;
  orderId?: string;
  message: string;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, message: "Unauthorized." };
  }

  const { profileId, clientName, orderId, message } = input;

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
    const queueKey = await generateUniqueIdForQueue("QU");

    const queue = await prisma.queue.create({
      data: {
        queueKey,
        profileId: profileId.trim(),
        clientName: clientName.trim(),
        orderId: orderId?.trim() || null,
        message: message.trim(),
        requestedById: session.user.id,
        status: "REQUESTED",
      },
      include: {
        requestedBy: true,
        assignedTo: true,
        links: true,
        profile: true,
      },
    });

    return {
      success: true,
      message: "Queue created successfully.",
      data: queue,
    };
  } catch (error) {
    console.error("❌ createQueueAction error:", error);
    return {
      success: false,
      message: "Something went wrong while creating the queue.",
    };
  }
}
