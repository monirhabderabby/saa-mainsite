import { sendMissedUpdateEmails } from "@/actions/cron-function/send-missedUpdate-emails";
import cron from "node-cron";

cron.schedule(
  "5 0 * * *", // 12:05 AM every day
  async () => {
    console.log("Running missed update email cron...");

    try {
      const result = await sendMissedUpdateEmails();

      if (result.success) {
        console.log("Missed update emails sent successfully:", result.message);
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
