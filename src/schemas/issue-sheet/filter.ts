import * as z from "zod";

export const issueSheetFilterSchema = z.object({
  profileId: z.string().optional(),
  serviceId: z.string().optional(),
  teamId: z.string().optional(),
  status: z.array(z.string()).optional(),
  clientName: z.string().optional(),
  orderId: z.string().optional(),
  createdFrom: z.date().optional(),
  createdTo: z.date().optional(),
});

export type IssueSheetFilter = z.infer<typeof issueSheetFilterSchema>;
