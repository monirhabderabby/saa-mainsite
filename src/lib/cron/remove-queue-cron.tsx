import prisma from "@/lib/prisma";
import cron from "node-cron";

cron.schedule(
  "0 */2 * * *", // Every 2 hours (12:00, 2:00, 4:00, 6:00...)
  async () => {
    console.log("Running queue cleanup cron...");

    try {
      const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

      // Find all matching queue IDs first
      const staleQueues = await prisma.queue.findMany({
        where: {
          status: "GIVEN",
          updatedAt: {
            lte: fortyEightHoursAgo,
          },
        },
        select: { id: true },
      });

      const staleQueueIds = staleQueues.map((q) => q.id);

      if (staleQueueIds.length === 0) {
        console.log("No stale queues found, skipping...");
        return;
      }

      await prisma.$transaction(async (tx) => {
        // Delete related QueueLinks first (child records)
        const deletedLinks = await tx.queueLink.deleteMany({
          where: { queueId: { in: staleQueueIds } },
        });

        // Delete the Queue records
        const deletedQueues = await tx.queue.deleteMany({
          where: { id: { in: staleQueueIds } },
        });

        console.log(
          `Deleted ${deletedQueues.count} queues and ${deletedLinks.count} links`,
        );
      });

      console.log("Queue cleanup completed successfully");
    } catch (error) {
      console.error("Queue cleanup cron failed:", error);
    }
  },
  {
    timezone: "Asia/Dhaka",
  },
);
