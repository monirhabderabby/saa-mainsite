import { z } from "zod";

export const registrationSchema = z.object({
  fullName: z
    .string({
      message: "Please enter your full name.",
    })
    .min(1, { message: "Please enter your full name." })
    .max(100, { message: "Full name can’t be longer than 100 characters." })
    .trim(),

  nickName: z
    .string({
      message: "Please provide a nickname.",
    })
    .min(1, { message: "Please provide a nickname." })
    .max(12, { message: "Nickname can’t be longer than 12 characters." })
    .trim(),

  serviceId: z
    .string({
      message: "Please select your service line",
    })
    .min(1, { message: "Service ID is required to continue." })
    .max(50, { message: "Service ID can’t be longer than 50 characters." })
    .trim(),

  email: z
    .string({
      message: "Your email address is required.",
    })
    .min(1, { message: "Your email address is required." })
    .email({ message: "That doesn’t look like a valid email address." })
    .max(100, { message: "Email can’t be longer than 100 characters." })
    .trim(),

  password: z
    .string({
      message: "Please enter your password",
    })
    .min(6, { message: "Your password should be at least 6 characters long." })
    .max(50, { message: "Password can’t be longer than 50 characters." })
    .trim(),

  employeeId: z
    .string({
      message: "Please enter your Employee ID.",
    })
    .min(1, { message: "Please enter your Employee ID." })
    .max(50, { message: "Employee ID can’t be longer than 50 characters." })
    .trim(),

  departmentId: z
    .string({
      message: "Please select your Department",
    })
    .min(1, { message: "Please select your Department" })
    .max(50, { message: "Department ID can’t be longer than 50 characters." })
    .trim(),

  designationId: z
    .string({
      message: "Please select a designation.",
    })
    .max(50, { message: "Designation can’t be longer than 50 characters." })
    .trim(),
});

export type RegistrationSchemaValues = z.infer<typeof registrationSchema>;
