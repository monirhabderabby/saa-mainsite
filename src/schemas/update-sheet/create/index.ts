import { countTipTapCharacters, getTextFromHtml } from "@/lib/utils";
import { UpdateTo } from "@prisma/client";
import { z } from "zod";

export const restrictedWords = [
  "adult content",
  "bank",
  "betting tips",
  "buy",
  "call me",
  "casino tricks",
  "credit",
  "credit repair",
  "crypto",
  "crack",
  "escort",
  "email",
  "exploit",
  "fees",
  "gambling",
  "gmail",
  "hack",
  "id card",
  "linkedin",
  "loan approval",
  "mobile",
  "money",
  "netlify",
  "outlook",
  "pay",
  "paypal",
  "payment",
  "phone number",
  "porn",
  "private",
  "skype",
  "telegram",
  "text me",
  "transfer",
  "western union",
  "whatsapp",
  "yahoo",
  "outside",
];

export const updateSheetCreateSchema = z
  .object({
    profileId: z
      .string({ message: "Profile ID is required and cannot be empty" })
      .min(1)
      .trim(),

    clientName: z
      .string({ message: "Please enter the client’s name" })
      .min(1)
      .trim(),

    orderId: z
      .string({ message: "Order ID is required to process this request" })
      .min(1)
      .trim(),

    attachments: z
      .string()
      .trim()
      .url({
        message: "Attachments must be a valid URL",
      })
      .optional(), // will be validated conditionally

    commentFromOperation: z.string().trim().optional(),
    commentFromSales: z.string().trim().optional(),

    updateTo: z.enum(Object.values(UpdateTo) as [UpdateTo, ...UpdateTo[]], {
      message: "You must select a valid update status",
    }),

    message: z
      .string({
        message: "Please write your message here",
      })
      .trim()
      .refine(
        (val) => countTipTapCharacters(val) <= 2500,
        "Message cannot exceed 2500 characters"
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
