import { z } from "zod";

export const restrictedWords = ["pay", "email", "gmail", "phone"];

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
  message: z
    .string()
    .max(2500, "Message cannot exceed 2500 characters")
    .refine(
      (val) => !restrictedWords.some((w) => val.toLowerCase().includes(w)),
      { message: "Message contains restricted words." }
    ),
});

export type UpdateSheetCreateSchema = z.infer<typeof updateSheetCreateSchema>;
