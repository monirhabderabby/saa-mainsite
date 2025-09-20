import { z } from "zod";

export const customPasswordResetSchema = z
  .object({
    currentPassword: z.string().min(6, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters long"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], // highlight confirmPassword field in UI
  });

export type CustomPasswordResetSchemaType = z.infer<
  typeof customPasswordResetSchema
>;
