// Updated Zod schema
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
  sendAt: z.string().datetime().optional(),
  createdAt: z.string().datetime().optional(),
  clientName: z.string().optional(),
  orderId: z.string().optional(), // <-- Added orderId
});

export type UpdateSheetFilter = z.infer<typeof updateSheetFilter>;
