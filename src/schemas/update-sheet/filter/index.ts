import * as z from "zod";

export const updateSheetFilter = z.object({
  profileId: z.string().min(1), // required string, cannot be empty
});

export type UpdateSheetFilter = z.infer<typeof updateSheetFilter>;
