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

export const addMemberSchema = z.object({
  teamId: z.string().min(1, "Team ID is required"),
  members: z.array(z.string()).min(1, "Select at least one member"),
});

export type AddMemberSchema = z.infer<typeof addMemberSchema>;
