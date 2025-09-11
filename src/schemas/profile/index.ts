import * as z from "zod";

export const profileSchema = z.object({
  name: z.string().min(1),
});

export type ProfileSchemaType = z.infer<typeof profileSchema>;
