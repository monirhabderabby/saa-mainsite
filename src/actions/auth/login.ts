"use server";

import { signIn } from "@/auth";
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

    if (user.accountStatus !== "ACTIVE") {
      return {
        success: false,
        message:
          "Your account is not active. Please contact your leader for assistance.",
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

    await signIn("credentials", {
      email: email,
      password: password,
      redirect: false,
    });
    return {
      success: true,
      message: "Login successful.",
      user: {
        id: user.id,
        email: user.email,
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
