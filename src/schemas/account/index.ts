import * as z from "zod";

export const personalInfoSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters"),
  email: z.string().trim().email("Please enter a valid email address"),
  dateOfBirth: z.date().optional(),
  phone: z.string().trim().optional(),
  parmanentAddress: z.string().trim().optional(),
  presentAddress: z.string().trim().optional(),
});

export type PersonalInfoSchema = z.infer<typeof personalInfoSchema>;
