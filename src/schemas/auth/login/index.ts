import { z } from "zod";

export const loginSchema = z.object({
  employeeId: z.string({
    message: "Please enter your Employee ID to continue.",
  }),
  password: z.string({ message: "A password is required to log in." }),
});

export type LoginSchemaValues = z.infer<typeof loginSchema>;
