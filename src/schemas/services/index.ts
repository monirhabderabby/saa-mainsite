import * as z from "zod";

export const serviceSchema = z.object({
  name: z.string().min(1),
});

export type SerivceSchemaType = z.infer<typeof serviceSchema>;
