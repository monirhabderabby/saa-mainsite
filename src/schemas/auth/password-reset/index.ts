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

export const forgetPasswordSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" }),
});

export type ForgetPasswordType = z.infer<typeof forgetPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters long"),
    confirmPassword: z
      .string()
      .min(8, "Password must be at least 8 characters long"),
    token: z.string({
      message: "Secret token is required",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

export type resetPasswordSchemaType = z.infer<typeof resetPasswordSchema>;
