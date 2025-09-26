import { getTextFromHtml } from "@/lib/utils";
import { UpdateTo } from "@prisma/client";
import { z } from "zod";

export const restrictedWords = ["pay", "email", "gmail", "mobile", "netlify"];

export const updateSheetCreateSchema = z
  .object({
    profileId: z
      .string({ message: "Profile ID is required and cannot be empty" })
      .min(1),

    clientName: z.string({ message: "Please enter the client’s name" }).min(1),

    orderId: z
      .string({ message: "Order ID is required to process this request" })
      .min(1),

    attachments: z.string().optional(), // will be validated conditionally

    commentFromOperation: z.string().optional(),
    commentFromSales: z.string().optional(),

    updateTo: z.enum(Object.values(UpdateTo) as [UpdateTo, ...UpdateTo[]], {
      message: "You must select a valid update status",
    }),

    message: z
      .string()
      .refine(
        (val) => {
          const text = getTextFromHtml(val); // convert HTML -> plain text
          return text.length <= 2500;
        },
        { message: "Message cannot exceed 2500 characters" }
      )
      .refine((val) => {
        const text = getTextFromHtml(val).toLowerCase();
        return !restrictedWords.some((word) =>
          text.includes(word.toLowerCase())
        );
      }),
  })
  .refine(
    (data) =>
      data.updateTo !== "DELIVERY" || // if not DELIVERY, no need for attachments
      (data.attachments && data.attachments.trim() !== ""), // DELIVERY requires attachments
    {
      message: "Oops! You forgot to add attachments for the DELIVERY update.",
      path: ["attachments"], // error will appear on attachments field
    }
  );

export type UpdateSheetCreateSchema = z.infer<typeof updateSheetCreateSchema>;
