import { UpdateTo } from "@prisma/client";
import * as z from "zod";

// Add "All" into the Prisma enum values
export const updateToSchema = z
  .enum(
    [...Object.values(UpdateTo), "All"] as unknown as [string, ...string[]],
    {
      message: "You must select a valid update status",
    }
  )
  .nullable()
  .optional();

export const updateSheetFilter = z.object({
  profileId: z.string().optional(),
  updateTo: z.string().optional(),
  tl: z.string().optional(),
  done: z.string().optional(),
  updateById: z.string().optional(),
  tlId: z.string().optional(),
  doneById: z.string().optional(),
  sendFrom: z.date().optional(),
  sendTo: z.string().datetime().optional(),
  createdFrom: z.date().optional(), // renamed
  createdTo: z.string().optional(), // optional end of range
  clientName: z.string().optional(),
  orderId: z.string().optional(),
});

export type UpdateSheetFilter = z.infer<typeof updateSheetFilter>;
