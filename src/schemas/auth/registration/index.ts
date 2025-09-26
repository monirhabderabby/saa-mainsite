import { z } from "zod";

export const registrationSchema = z.object({
  fullName: z.string().min(1, { message: "Full name is required" }).trim(),
  nickName: z.string().min(1, { message: "Nick name is required" }).trim(),

  serviceId: z.string().min(1, { message: "Service ID is required" }).trim(),

  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Please enter a valid email address" })
    .trim(),

  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" })
    .trim(), // trims spaces at start and end

  employeeId: z.string().min(1, { message: "Employee ID is required" }).trim(),

  departmentId: z
    .string()
    .min(1, { message: "Department ID is required" })
    .trim(),

  designationId: z
    .string({
      message: "Designation is required",
    })
    .trim(),
});

export type RegistrationSchemaValues = z.infer<typeof registrationSchema>;
