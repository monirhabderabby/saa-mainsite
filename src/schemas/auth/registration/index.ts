import { z } from "zod";

export const registrationSchema = z
  .object({
    fullName: z.string().min(1, { message: "Full name is required" }),

    serviceId: z.string().min(1, { message: "Service ID is required" }),

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
    path: ["confirmPassword"], // error shows under confirmPassword field
  });

export type RegistrationSchemaValues = z.infer<typeof registrationSchema>;
