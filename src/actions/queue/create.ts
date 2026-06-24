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
    // Determine whether the creator is an Operation user — this changes the
    // scope of the duplicate check below.
    const creator = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });
    const isOperation = creator?.role === "OPERATION_MEMBER";

    // ── 5-hour duplicate prevention ────────────────────────────────────────────
    // Block if a queue with the same clientName + serviceId already exists
    // (regardless of status — REQUESTED, GIVEN, anything) within the last 5 hours.
    //   • Operation: the lock is SERVICE-WIDE — any user in that service line
    //     blocks the client+service combination for everyone.
    //   • Others (Admin, etc.): the lock is per-user (unchanged).
    const fiveHoursAgo = new Date(Date.now() - 5 * 60 * 60 * 1000);

    const existing = await prisma.queue.findFirst({
      where: {
        // Service-wide for Operation (no requestedById), per-user otherwise.
        ...(isOperation ? {} : { requestedById: session.user.id }),
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
      include: {
        requestedBy: { select: { fullName: true } },
      },
    });

    if (existing) {
      const minutesAgo = Math.floor(
        (Date.now() - existing.createdAt.getTime()) / 1000 / 60,
      );
      const minutesLeft = Math.max(300 - minutesAgo, 0); // 300 min = 5 hours
      const hoursLeft = Math.floor(minutesLeft / 60);
      const minsLeft = minutesLeft % 60;
      const timeLeftStr =
        hoursLeft > 0
          ? `${hoursLeft}h ${minsLeft}m`
          : `${minutesLeft} minute(s)`;

      const message = isOperation
        ? `A queue for "${clientName.trim()}" under this service was already requested by ${existing.requestedBy.fullName} ${minutesAgo} min ago. Please wait ${timeLeftStr} before requesting it again.`
        : `A queue for "${clientName.trim()}" already exists (submitted ${minutesAgo} min ago). Please wait ${timeLeftStr} before submitting again.`;

      return {
        success: false,
        message,
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
