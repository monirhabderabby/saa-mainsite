"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { getUserChannel, PUSHER_EVENTS } from "@/lib/pusher/constants";
import pusherServer from "@/lib/pusher/pusher";
import { QueueNotificationPayload } from "@/types/notification/notifications";
import { revalidatePath } from "next/cache";

export async function submitQueueLinksAction(input: {
  queueId: string;
  links: { title: string; url: string }[];
}) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, message: "Unauthorized." };
  }

  const { queueId, links } = input;

  if (!links || links.length === 0) {
    return { success: false, message: "At least one link is required." };
  }

  for (let i = 0; i < links.length; i++) {
    if (!links[i].title?.trim()) {
      return { success: false, message: `Link ${i + 1}: Title is required.` };
    }
    if (!links[i].url?.trim()) {
      return { success: false, message: `Link ${i + 1}: URL is required.` };
    }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || (user.role !== "SALES_MEMBER" && user.role !== "ADMIN")) {
      return {
        success: false,
        message: "Only sales members can submit links.",
      };
    }

    const queue = await prisma.queue.findUnique({
      where: { id: queueId },
      include: {
        requestedBy: true,
        profile: true,
      },
    });

    if (!queue) {
      return { success: false, message: "Queue not found." };
    }

    // Replace all links atomically and mark as GIVEN
    await prisma.$transaction([
      prisma.queueLink.deleteMany({ where: { queueId } }),
      prisma.queueLink.createMany({
        data: links.map((link) => ({
          queueId,
          title: link.title.trim(),
          url: link.url.trim(),
        })),
      }),
      prisma.queue.update({
        where: { id: queueId },
        data: {
          status: "GIVEN",
          assignedToId: session.user.id,
        },
      }),
    ]);

    const queueCreatorId = queue.requestedBy.id;

    const payload: QueueNotificationPayload = {
      type: "QUEUE_GIVEN",
      queueId: queue.id,
      queueKey: queue.queueKey,
      clientName: queue.clientName,
      profileName: queue.profile.name,
      profileId: queue.profileId,
      requestedBy: queue.requestedBy.fullName,
      message: queue.message,
      createdAt: queue.createdAt.toISOString(),
    };

    // Trigger operation member who requested
    pusherServer.trigger(
      getUserChannel(queueCreatorId),
      PUSHER_EVENTS.QUEUE_GIVEN,
      payload,
    );

    revalidatePath("/dashboard/queue");
    return {
      success: true,
      message: "Links submitted and queue marked as Given.",
    };
  } catch (error) {
    console.error("❌ submitQueueLinksAction error:", error);
    return {
      success: false,
      message: "Something went wrong while submitting links.",
    };
  }
}
