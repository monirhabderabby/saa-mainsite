import { z } from "zod";

export const loginSchema = z.object({
  employeeId: z.string().min(1, { message: "Employee Id is required" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" }),
});

export type LoginSchemaValues = z.infer<typeof loginSchema>;
