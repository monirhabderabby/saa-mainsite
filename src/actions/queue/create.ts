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
  serviceId?: string;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, message: "Unauthorized." };
  }

  const { profileId, clientName, orderId, message, serviceId } = input;

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
    // ── 5-hour duplicate prevention ────────────────────────────────────────────
    // Block if the same user already has ANY queue (regardless of status —
    // REQUESTED, GIVEN, anything) with the same clientName + serviceId
    // created within the last 5 hours.
    const fiveHoursAgo = new Date(Date.now() - 5 * 60 * 60 * 1000);

    const existing = await prisma.queue.findFirst({
      where: {
        requestedById: session.user.id,
        clientName: {
          equals: clientName.trim(),
          mode: "insensitive",
        },
        // Scope to the exact serviceId that was submitted (including null).
        // This means "FSD + aromaitaly" and "null + aromaitaly" are treated
        // as separate combinations, which is the correct behaviour.
        serviceId: serviceId?.trim()
          ? { equals: serviceId.trim() }
          : { equals: null },
        createdAt: { gte: fiveHoursAgo },
        // ✅ Intentionally NO status filter — a GIVEN queue still blocks re-submission
      },
    });

    if (existing) {
      const minutesAgo = Math.floor(
        (Date.now() - existing.createdAt.getTime()) / 1000 / 60,
      );
      const minutesLeft = 300 - minutesAgo; // 300 min = 5 hours
      const hoursLeft = Math.floor(minutesLeft / 60);
      const minsLeft = minutesLeft % 60;
      const timeLeftStr =
        hoursLeft > 0
          ? `${hoursLeft}h ${minsLeft}m`
          : `${minutesLeft} minute(s)`;

      return {
        success: false,
        message: `A queue for "${clientName.trim()}" already exists (submitted ${minutesAgo} min ago). Please wait ${timeLeftStr} before submitting again.`,
      };
    }
    // ──────────────────────────────────────────────────────────────────────────

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
        ...(serviceId?.trim() ? { serviceId: serviceId.trim() } : {}),
      },
      include: {
        requestedBy: true,
        assignedTo: true,
        links: true,
        profile: true,
        service: true,
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
