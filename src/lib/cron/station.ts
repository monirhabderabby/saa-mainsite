import prisma from "@/lib/prisma";
import cron from "node-cron";

cron.schedule(
  "0 7,15,23 * * *", // 7 AM, 3 PM, 11 PM
  async () => {
    console.log("Running station cleanup cron...");

    try {
      await prisma.$transaction(async (tx) => {
        await tx.stationAssignmentProfile.deleteMany();
        await tx.stationAssignment.deleteMany();
        await tx.stationUpdate.deleteMany();
      });

      console.log("Stations cleared successfully");
    } catch (error) {
      console.error("Cron delete failed:", error);
    }
  },
  {
    timezone: "Asia/Dhaka", // 🇧🇩 correct timezone
  },
);
