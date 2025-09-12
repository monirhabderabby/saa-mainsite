import { z } from "zod";

export const restrictedWords = ["pay", "email", "gmail", "mobile"];

export const updateSheetCreateSchema = z.object({
  profileId: z
    .string({
      message: "Profile ID is required and cannot be empty",
    })
    .min(1),

  clientName: z
    .string({
      message: "Please enter the client’s name",
    })
    .min(1),

  orderId: z
    .string({
      message: "Order ID is required to process this request",
    })
    .min(1),

  attachments: z.string().optional(), // totally optional

  commentFromOperation: z.string().optional(), // totally optional

  commentFromSales: z.string().optional(), // totally optional

  updateTo: z
    .string({
      message: "You must select an update status",
    })
    .min(1),
  message: z.string().refine((val) => val.length <= 2500, {
    message: "Message cannot exceed 2500 characters",
  }),
});

export type UpdateSheetCreateSchema = z.infer<typeof updateSheetCreateSchema>;
