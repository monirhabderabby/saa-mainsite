"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function deleteQueueAction(queueId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, message: "Unauthorized." };
  }

  try {
    const queue = await prisma.queue.findUnique({
      where: { id: queueId },
      select: { requestedById: true },
    });

    if (!queue) {
      return { success: false, message: "Queue not found." };
    }

    if (queue.requestedById !== session.user.id) {
      return {
        success: false,
        message: "You are not allowed to delete this queue.",
      };
    }

    // QueueLinks are cascade-deleted via schema onDelete: Cascade
    await prisma.queue.delete({ where: { id: queueId } });

    return { success: true, message: "Queue deleted successfully." };
  } catch (error) {
    console.error("❌ deleteQueueAction error:", error);
    return {
      success: false,
      message: "Something went wrong while deleting the queue.",
    };
  }
}
