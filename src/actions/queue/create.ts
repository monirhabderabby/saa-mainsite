"use server";

import { auth } from "@/auth";
import { getSalesMembersForProfile } from "@/helper/notification/notification-helpers";
import prisma from "@/lib/prisma";
import { getUserChannel, PUSHER_EVENTS } from "@/lib/pusher/constants";
import pusherServer from "@/lib/pusher/pusher";
import { generateUniqueIdForQueue } from "@/lib/utils";
import { QueueNotificationPayload } from "@/types/notification/notifications";

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

    // 🔔 Find all sales members assigned to this profile
    const salesMemberIds = await getSalesMembersForProfile(profileId.trim());

    if (salesMemberIds.length > 0) {
      const payload: QueueNotificationPayload = {
        type: "QUEUE_REQUESTED",
        queueId: queue.id,
        queueKey: queue.queueKey,
        clientName: queue.clientName,
        profileName: queue.profile.name,
        profileId: queue.profileId,
        requestedBy: queue.requestedBy.fullName,
        message: queue.message,
        createdAt: queue.createdAt.toISOString(),
      };

      // Trigger on each sales member's private channel
      await Promise.all(
        salesMemberIds.map((userId) =>
          pusherServer.trigger(
            getUserChannel(userId),
            PUSHER_EVENTS.QUEUE_REQUESTED,
            payload,
          ),
        ),
      );
    }

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
