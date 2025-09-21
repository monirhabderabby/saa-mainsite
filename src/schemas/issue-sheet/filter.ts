// schemas/issue-sheet/filter.ts
import * as z from "zod";

const STATUS_ENUM = z.enum(["open", "wip", "done", "cancelled", "dispute"]);

export const issueSheetFilterSchema = z.object({
  profileId: z.string().optional().nullable(),
  serviceId: z.string().optional().nullable(),
  teamId: z.string().optional().nullable(),
  // strict enum array
  status: z.array(STATUS_ENUM).optional(),
  clientName: z.string().optional().nullable(),
  orderId: z.string().optional().nullable(),
  // Accept Date objects (client) or ISO datetime strings (server / persisted)
  createdFrom: z.union([z.date(), z.string().datetime()]).optional().nullable(),
  createdTo: z.union([z.date(), z.string().datetime()]).optional().nullable(),
});

export type IssueSheetFilter = z.infer<typeof issueSheetFilterSchema>;

export { STATUS_ENUM as IssueStatusEnum };
