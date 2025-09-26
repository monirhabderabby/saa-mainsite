import { z } from "zod";

export const issueSheetSchema = z
  .object({
    clientName: z
      .string()
      .min(1, { message: "Please enter the client's name" }),
    orderId: z.string().min(1, { message: "Please provide the order ID" }),
    profileId: z.string().min(1, { message: "Please select a profile" }),
    serviceId: z.string().min(1, { message: "Please select a service" }),
    orderPageUrl: z.string().optional(),
    inboxPageUrl: z.string().optional(),
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
      path: ["urlGroup"], // virtual field
    }
  );

// Extend type to include virtual field
export type IssueSheetSchemaType = z.infer<typeof issueSheetSchema> & {
  urlGroup?: string;
};
