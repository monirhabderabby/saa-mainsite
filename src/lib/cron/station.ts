import prisma from "@/lib/prisma";
import cron from "node-cron";

cron.schedule(
  "0 6,14,22 * * *",
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
    timezone: "Asia/Dhaka", // 🇧🇩 IMPORTANT
  }
);
