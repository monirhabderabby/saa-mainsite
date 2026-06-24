"use server";

import { auth } from "@/auth";
import { getSalesMembersForProfile } from "@/helper/notification/notification-helpers";
import prisma from "@/lib/prisma";
import { getUserChannel, PUSHER_EVENTS } from "@/lib/pusher/constants";
import pusherServer from "@/lib/pusher/pusher";
import { generateUniqueIdForQueue } from "@/lib/utils";
import { QueueNotificationPayload } from "@/types/notification/notifications";

export interface BulkQueueInput {
  profileId: string;
  clientName: string;
  orderId?: string;
  message: string;
  serviceId?: string;
}

export interface BulkRowResult {
  index: number;
  success: boolean;
  message: string;
  queueKey?: string;
  clientName?: string;
}

export interface BulkCreateResponse {
  success: boolean;
  message: string;
  totalSubmitted: number;
  totalCreated: number;
  totalFailed: number;
  results: BulkRowResult[];
}

const MAX_BULK_ROWS = 200;

// 🚧 Bulk upload is currently paused for all users. Flip to `true` to re-enable.
// Typed as `boolean` (not the literal `false`) so the guard below doesn't make
// the rest of the action statically unreachable.
const BULK_UPLOAD_ENABLED: boolean = false;

export async function bulkCreateQueueAction(
  rows: BulkQueueInput[],
): Promise<BulkCreateResponse> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      message: "Unauthorized.",
      totalSubmitted: 0,
      totalCreated: 0,
      totalFailed: 0,
      results: [],
    };
  }

  if (!BULK_UPLOAD_ENABLED) {
    return {
      success: false,
      message: "Bulk upload is currently disabled.",
      totalSubmitted: 0,
      totalCreated: 0,
      totalFailed: 0,
      results: [],
    };
  }

  if (!Array.isArray(rows) || rows.length === 0) {
    return {
      success: false,
      message: "No rows provided.",
      totalSubmitted: 0,
      totalCreated: 0,
      totalFailed: 0,
      results: [],
    };
  }

  if (rows.length > MAX_BULK_ROWS) {
    return {
      success: false,
      message: `Too many rows. Maximum allowed is ${MAX_BULK_ROWS}.`,
      totalSubmitted: rows.length,
      totalCreated: 0,
      totalFailed: rows.length,
      results: [],
    };
  }

  const fiveHoursAgo = new Date(Date.now() - 5 * 60 * 60 * 1000);
  const userId = session.user.id;
  const results: BulkRowResult[] = [];
  const createdQueues: Array<{
    profileId: string;
    payload: QueueNotificationPayload;
  }> = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const clientName = row.clientName?.trim() ?? "";
    const profileId = row.profileId?.trim() ?? "";
    const message = row.message?.trim() ?? "";
    const orderId = row.orderId?.trim() || undefined;
    const serviceId = row.serviceId?.trim() || undefined;

    if (!profileId) {
      results.push({
        index: i,
        success: false,
        message: "Profile is required.",
        clientName,
      });
      continue;
    }
    if (!clientName) {
      results.push({
        index: i,
        success: false,
        message: "Client name is required.",
      });
      continue;
    }
    if (!message) {
      results.push({
        index: i,
        success: false,
        message: "Message is required.",
        clientName,
      });
      continue;
    }

    try {
      const existing = await prisma.queue.findFirst({
        where: {
          requestedById: userId,
          clientName: { equals: clientName, mode: "insensitive" },
          serviceId: serviceId ? { equals: serviceId } : { equals: null },
          createdAt: { gte: fiveHoursAgo },
        },
        select: { createdAt: true },
      });

      if (existing) {
        const minutesAgo = Math.floor(
          (Date.now() - existing.createdAt.getTime()) / 1000 / 60,
        );
        const minutesLeft = Math.max(300 - minutesAgo, 0);
        const hoursLeft = Math.floor(minutesLeft / 60);
        const minsLeft = minutesLeft % 60;
        const timeLeftStr =
          hoursLeft > 0
            ? `${hoursLeft}h ${minsLeft}m`
            : `${minutesLeft} minute(s)`;

        results.push({
          index: i,
          success: false,
          message: `Duplicate within 5h — wait ${timeLeftStr}.`,
          clientName,
        });
        continue;
      }

      const queueKey = await generateUniqueIdForQueue("QU");
      const queue = await prisma.queue.create({
        data: {
          queueKey,
          profileId,
          clientName,
          orderId: orderId ?? null,
          message,
          requestedById: userId,
          status: "REQUESTED",
          ...(serviceId ? { serviceId } : {}),
        },
        include: {
          requestedBy: { select: { fullName: true } },
          profile: { select: { name: true } },
        },
      });

      results.push({
        index: i,
        success: true,
        message: "Created.",
        queueKey: queue.queueKey,
        clientName: queue.clientName,
      });

      createdQueues.push({
        profileId: queue.profileId,
        payload: {
          type: "QUEUE_REQUESTED",
          queueId: queue.id,
          queueKey: queue.queueKey,
          clientName: queue.clientName,
          profileName: queue.profile.name,
          profileId: queue.profileId,
          requestedBy: queue.requestedBy.fullName,
          message: queue.message,
          createdAt: queue.createdAt.toISOString(),
        },
      });
    } catch (err) {
      console.error("❌ bulkCreateQueueAction row error:", err);
      results.push({
        index: i,
        success: false,
        message: "Failed to create.",
        clientName,
      });
    }
  }

  // Notify sales members per profile after all rows processed.
  const notificationsByProfile = new Map<string, QueueNotificationPayload[]>();
  for (const { profileId, payload } of createdQueues) {
    const list = notificationsByProfile.get(profileId) ?? [];
    list.push(payload);
    notificationsByProfile.set(profileId, list);
  }

  await Promise.all(
    Array.from(notificationsByProfile.entries()).map(
      async ([profileId, payloads]) => {
        try {
          const salesMemberIds = await getSalesMembersForProfile(profileId);
          if (salesMemberIds.length === 0) return;
          await Promise.all(
            salesMemberIds.flatMap((userId) =>
              payloads.map((p) =>
                pusherServer.trigger(
                  getUserChannel(userId),
                  PUSHER_EVENTS.QUEUE_REQUESTED,
                  p,
                ),
              ),
            ),
          );
        } catch (err) {
          console.error("❌ bulk notify error:", err);
        }
      },
    ),
  );

  const totalCreated = results.filter((r) => r.success).length;
  const totalFailed = results.length - totalCreated;

  return {
    success: totalCreated > 0,
    message:
      totalCreated === results.length
        ? `All ${totalCreated} queues created successfully.`
        : totalCreated === 0
          ? `No queues were created. ${totalFailed} failed.`
          : `${totalCreated} created, ${totalFailed} failed.`,
    totalSubmitted: rows.length,
    totalCreated,
    totalFailed,
    results,
  };
}
