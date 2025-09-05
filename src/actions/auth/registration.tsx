"use server";

import prisma from "@/lib/prisma";
import {
  registrationSchema,
  RegistrationSchemaValues,
} from "@/schemas/auth/registration";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

export async function registerAction(data: RegistrationSchemaValues) {
  // ✅ Validate user input
  const parsed = registrationSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      message: "Invalid input. Please check your data.",
    };
  }

  const { email, employeeId, firstName, lastName, password } = parsed.data;

  try {
    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // ✅ Create user (relies on unique constraints in schema)
    const user = await prisma.user.create({
      data: {
        email,
        employeeId,
        firstName,
        lastName,
        password: hashedPassword,
        status: "PENDING",
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        employeeId: true,
        createdAt: true,
      },
    });

    return {
      success: true,
      message: "Registration successful.",
      user,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    // ✅ Handle unique constraint violations safely
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      const target = (err.meta?.target as string[]) || [];
      if (target.includes("email")) {
        return { success: false, message: "Email already in use." };
      }
      if (target.includes("employeeId")) {
        return { success: false, message: "Employee ID already in use." };
      }
      return { success: false, message: "Duplicate field value." };
    }

    console.error("Registration error:", err);
    return {
      success: false,
      message: "Something went wrong. Please try again.",
    };
  }
}
