import { z } from "zod";

export const registrationSchema = z
  .object({
    firstName: z.string().min(1, { message: "First name is required" }),

    lastName: z.string().min(1, { message: "Last name is required" }),

    email: z
      .string()
      .min(1, { message: "Email is required" })
      .email({ message: "Please enter a valid email address" }),

    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters long" }),

    confirmPassword: z
      .string()
      .min(1, { message: "Confirm password is required" }),

    employeeId: z.string().min(1, { message: "Employee ID is required" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], // show error under confirmPassword field
  });

export type RegistrationSchemaValues = z.infer<typeof registrationSchema>;
