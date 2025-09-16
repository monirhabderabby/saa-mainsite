import { IssueStatus } from "@prisma/client";
import * as z from "zod";

// Add "All" into the Prisma enum values
export const statusSchema = z
  .enum([...Object.values(IssueStatus), "All"] as unknown as [
    string,
    ...string[],
  ])
  .optional();

export const issueSheetFilterSchema = z.object({
  profileId: z.string().optional(),
  serviceId: z.string().optional(),
  teamId: z.string().optional(),
  status: statusSchema,
  clientName: z.string().optional(),
  orderId: z.string().optional(),
  createdFrom: z.string().datetime().optional(),
  createdTo: z.string().datetime().optional(),
});

export type IssueSheetFilter = z.infer<typeof issueSheetFilterSchema>;
