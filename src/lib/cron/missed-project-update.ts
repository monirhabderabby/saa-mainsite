import { sendMissedUpdateEmails } from "@/actions/cron-function/send-missedUpdate-emails";
import cron from "node-cron";

export function initializeCronJobs() {
  cron.schedule(
    //   "5 0 * * *", // 12:05 AM every day
    "15 18 * * *", // 5:45 PM every day (17:45 in 24-hour format)
    async () => {
      console.log("Running missed update email cron...");

      try {
        const result = await sendMissedUpdateEmails();

        if (result.success) {
          console.log(
            "Missed update emails sent successfully:",
            result.message,
          );
        } else {
          console.error("Failed to send missed update emails:", result.message);
        }
      } catch (error) {
        console.error("Cron email send failed:", error);
      }
    },
    {
      timezone: "Asia/Dhaka", // 🇧🇩 IMPORTANT
    },
  );
}
