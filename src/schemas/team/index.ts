import * as z from "zod";

export const teamSchema = z.object({
  name: z.string().min(1, {
    message: "Team name is required",
  }),
  serviceId: z.string().min(1, {
    message: "Please select a service",
  }),
});

export type TeamSchemaType = z.infer<typeof teamSchema>;
