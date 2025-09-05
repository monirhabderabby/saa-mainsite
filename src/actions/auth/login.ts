"use server";

import prisma from "@/lib/prisma";
import { loginSchema, LoginSchemaValues } from "@/schemas/auth/login";
import bcrypt from "bcryptjs";

export async function loginAction(data: LoginSchemaValues) {
  // 1. Validate input against schema
  const parsed = loginSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      message: "Invalid input. Please check your email and password.",
    };
  }

  const { email, password } = parsed.data;

  try {
    // 2. Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return {
        success: false,
        message: "No account found with this email.",
      };
    }

    // 3. Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return {
        success: false,
        message: "Incorrect password.",
      };
    }

    // 4. Success – return user data (omit sensitive fields)
    return {
      success: true,
      message: "Login successful.",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        designation: user.designation,
        departmentId: user.departmentId,
      },
    };
  } catch (err) {
    console.error("Login error:", err);
    return {
      success: false,
      message: "Something went wrong. Please try again.",
    };
  }
}
