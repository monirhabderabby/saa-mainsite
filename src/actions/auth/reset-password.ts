"use server";

import prisma from "@/lib/prisma";
import {
  resetPasswordSchema,
  resetPasswordSchemaType,
} from "@/schemas/auth/password-reset";
import bcrypt from "bcryptjs";
import crypto from "crypto";

/**
 * Handles password reset using a magic link token.
 *
 * @param data - The token and new password from the user
 * @returns success status and meaningful message
 */
export async function resetPasswordAction(data: resetPasswordSchemaType) {
  // 1️⃣ Validate input
  const parsedValue = resetPasswordSchema.safeParse(data);
  if (!parsedValue.success) {
    return {
      success: false,
      message:
        "Invalid input. Please ensure your password meets the requirements.",
    };
  }

  const { token: rawToken, password: newPassword } = parsedValue.data;

  // 2️⃣ Hash incoming token to match stored hashed token
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  // 3️⃣ Find the magic link in DB
  const forgetPassLink = await prisma.forgetPasswordLinks.findUnique({
    where: { token: hashedToken },
  });

  if (!forgetPassLink) {
    return {
      success: false,
      message: "Invalid or expired password reset link.",
    };
  }

  // 4️⃣ Check if token is expired
  const now = new Date();
  if (forgetPassLink.expireOn < now) {
    // Delete expired token
    await prisma.forgetPasswordLinks.delete({
      where: { id: forgetPassLink.id },
    });
    return {
      success: false,
      message:
        "This password reset link has expired. Please request a new one.",
    };
  }

  // 5️⃣ Fetch user
  const user = await prisma.user.findUnique({
    where: { id: forgetPassLink.userId },
    select: { password: true, id: true },
  });

  if (!user) {
    return {
      success: false,
      message: "User not found. Cannot reset password.",
    };
  }

  // 6️⃣ Prevent reusing the same password
  const isSamePassword = await bcrypt.compare(newPassword, user.password);
  if (isSamePassword) {
    return {
      success: false,
      message: "New password cannot be the same as the current password.",
    };
  }

  // 7️⃣ Hash new password
  const hashedNewPassword = await bcrypt.hash(newPassword, 10);

  // 8️⃣ Update user password in DB
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedNewPassword },
  });

  // 9️⃣ Delete used magic link to prevent reuse
  await prisma.forgetPasswordLinks.delete({ where: { id: forgetPassLink.id } });

  // ✅ Success
  return {
    success: true,
    message:
      "Your password has been successfully reset. You can now log in with your new password.",
  };
}
