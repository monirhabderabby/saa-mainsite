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
  .optional();

export const updateSheetFilter = z.object({
  profileId: z.string().optional(),
  updateTo: updateToSchema,
  tl: z.enum(["tlChecked", "notTlCheck", "All"]).optional(),
  done: z.enum(["done", "notDone", "All"]).optional(),
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
