import { ComplaintPriority, ComplaintSource } from "@prisma/client";
import { z } from "zod";

export const complaintSources = Object.values(ComplaintSource);
export const complaintPriorities = Object.values(ComplaintPriority);

export const complaintSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  source: z.nativeEnum(ComplaintSource, {
    message: "Please select a source",
  }),
  priority: z.nativeEnum(ComplaintPriority, {
    message: "Please select a priority level",
  }),
  message: z.string().min(10, "Message must be at least 10 characters"),
  supportingDocs: z.array(
    z.object({ value: z.string().url("Must be a valid URL").or(z.literal("")) })
  ),
});

export type ComplaintSchemaType = z.infer<typeof complaintSchema>;