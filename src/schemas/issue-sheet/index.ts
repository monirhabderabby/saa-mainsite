import { z } from "zod";

export const issueSheetSchema = z.object({
  clientName: z.string().min(1, {
    message: "Client name is required",
  }),
  orderId: z.string().min(1, {
    message: "Order ID is required",
  }),
  profileId: z.string({
    message: "Profile ID is required",
  }),
  serviceId: z.string({
    message: "Service ID is required",
  }),
  orderPageUrl: z
    .string()

    .optional()
    .or(z.literal("")),
  inboxPageUrl: z
    .string()

    .optional()
    .or(z.literal("")),
  specialNotes: z
    .string()

    .optional()
    .or(z.literal("")),
  noteForSales: z
    .string()

    .optional()
    .or(z.literal("")),
  fileOrMeetingLink: z
    .string()

    .optional()
    .or(z.literal("")),
});

export type IssueSheetSchemaType = z.infer<typeof issueSheetSchema>;
