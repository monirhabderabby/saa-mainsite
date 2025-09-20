"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import {
  customPasswordResetSchema,
  CustomPasswordResetSchemaType,
} from "@/schemas/auth/password-reset";
import bcrypt from "bcryptjs";

/**
 * Custom password reset action
 * - Validates input against Zod schema
 * - Ensures user is authenticated
 * - Verifies current password
 * - Prevents reusing the same password
 * - Hashes and updates the new password in the database
 */
export async function customPasswordResetAction(
  data: CustomPasswordResetSchemaType
) {
  try {
    // Get authenticated user
    const currentSession = await auth();

    if (!currentSession?.user?.id) {
      return {
        success: false,
        message: "Unauthorized request.",
      };
    }

    // Validate input with Zod schema
    const parsedResult = customPasswordResetSchema.safeParse(data);

    if (!parsedResult.success) {
      return {
        success: false,
        message: "Invalid input. Please check your form fields.",
      };
    }

    const { currentPassword, newPassword } = parsedResult.data;

    // Fetch user with password hash
    const existingUser = await prisma.user.findUnique({
      where: { id: currentSession.user.id },
      select: { password: true },
    });

    if (!existingUser) {
      return {
        success: false,
        message: "User not found.",
      };
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      existingUser.password
    );

    if (!isCurrentPasswordValid) {
      return {
        success: false,
        message: "Current password is incorrect.",
      };
    }

    // Prevent reusing the same password
    const isSamePassword = await bcrypt.compare(
      newPassword,
      existingUser.password
    );

    if (isSamePassword) {
      return {
        success: false,
        message: "New password cannot be the same as the current password.",
      };
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update user password in database
    await prisma.user.update({
      where: { id: currentSession.user.id },
      data: { password: hashedNewPassword },
    });

    return {
      success: true,
      message: "Password has been successfully updated.",
    };
  } catch (error) {
    console.error("Password reset error:", error); // Log for monitoring
    return {
      success: false,
      message: "An unexpected error occurred. Please try again later.",
    };
  }
}
