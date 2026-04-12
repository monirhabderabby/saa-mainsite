import { countTipTapCharacters, getTextFromHtml } from "@/lib/utils";
import { ComplaintPriority } from "@prisma/client";
import { z } from "zod";

export const complaintPriorities = Object.values(ComplaintPriority);

export const complaintSchema = z.object({
  subject: z.string().min(1, "Subject is required"),

  priority: z.nativeEnum(ComplaintPriority, {
    message: "Please select a priority level",
  }),
  message: z
    .string({
      message: "Please write your message here",
    })
    .trim()
    .refine(
      (val) => countTipTapCharacters(val) <= 2500,
      "Message cannot exceed 2500 characters",
    )
    .refine((val) => {
      const text = getTextFromHtml(val).toLowerCase();
      return !["mc"].some((word) => text.includes(word.toLowerCase()));
    }),
  supportingDocs: z.array(
    z.object({
      value: z.string().url("Must be a valid URL").or(z.literal("")),
    }),
  ),
});

export type ComplaintSchemaType = z.infer<typeof complaintSchema>;
