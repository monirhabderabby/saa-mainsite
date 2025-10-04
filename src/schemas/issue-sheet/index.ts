import { z } from "zod";

const restrictedUrlSchema = z
  .string()
  .url({ message: "Must be a valid URL" })
  .refine(
    (val) =>
      val === "" ||
      val.startsWith("https://drive.google.com/file/d/") ||
      val.startsWith("https://prnt.sc/"),
    {
      message:
        "Only Google Drive (https://drive.google.com/file/d/<fileId>/view) or Lightshot (https://prnt.sc/<id>) links are allowed",
    }
  )
  .optional()
  .or(z.literal("")); // allow empty string

const fiverrOrderIdRegex = /^FO[A-Z0-9]+$/; // matches FO followed by alphanumeric characters

export const issueSheetSchema = z
  .object({
    clientName: z
      .string()
      .min(1, { message: "Please enter the client's name" }),

    // ✅ Fiverr Order ID: optional, but if provided must match format
    orderId: z
      .string()
      .optional()
      .refine((val) => !val || fiverrOrderIdRegex.test(val), {
        message:
          "Order ID must be a valid Fiverr order ID (e.g., FO414327B25420)",
      }),

    profileId: z.string().min(1, { message: "Please select a profile" }),
    serviceId: z.string().min(1, { message: "Please select a service" }),

    // ✅ Only these two restricted
    orderPageUrl: restrictedUrlSchema,
    inboxPageUrl: restrictedUrlSchema,

    // ✅ Free input allowed
    fileOrMeetingLink: z.string().optional(),
    specialNotes: z.string().optional(),
    noteForSales: z.string().optional(),
  })
  .refine(
    (data) =>
      (data.orderPageUrl?.trim() || "") !== "" ||
      (data.inboxPageUrl?.trim() || "") !== "" ||
      (data.fileOrMeetingLink?.trim() || "") !== "",
    {
      message:
        "Please provide at least one: Order Page URL, Inbox Page URL, or File/Meeting Link",
      path: ["urlGroup"],
    }
  );

export type IssueSheetSchemaType = z.infer<typeof issueSheetSchema> & {
  urlGroup?: string;
};
