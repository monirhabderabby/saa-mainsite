import { z } from "zod";

export const registrationSchema = z.object({
  fullName: z.string().min(1, { message: "Full name is required" }),

  serviceId: z.string().min(1, { message: "Service ID is required" }),

  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Please enter a valid email address" }),

  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" }),

  employeeId: z.string().min(1, { message: "Employee ID is required" }),

  role: z.enum(["OPERATION_MEMBER", "SALES_MEMBER", "ADMIN"], {
    message: "Role must be either OPERATION_MEMBER or SALES_MEMBER",
  }),
  designationId: z.string({
    message: "Designation is required",
  }),
});

export type RegistrationSchemaValues = z.infer<typeof registrationSchema>;
