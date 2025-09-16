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

export const responsibilityZodSchema = z.object({
  responsibility: z
    .string({
      message: "Responsibility is required",
    })
    .min(1, "Responsibility cannot be empty")
    .max(500, "Responsibility cannot exceed 500 characters")
    .trim(),

  teamId: z
    .string({
      message: "Team ID is required",
    })
    .min(1, "Team ID cannot be empty"),

  userId: z
    .string({
      message: "Team ID is required",
    })
    .min(1, "Team ID cannot be empty"),
});

// Optional: You can also create a type from the schema
export type ResponsibilitySchemaType = z.infer<typeof responsibilityZodSchema>;
