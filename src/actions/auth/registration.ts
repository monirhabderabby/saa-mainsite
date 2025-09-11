"use server";

import { EmailVerification } from "@/email-templates/email-verification";
import prisma from "@/lib/prisma";
import { resend } from "@/lib/resend";
import {
  registrationSchema,
  RegistrationSchemaValues,
} from "@/schemas/auth/registration";
import { Prisma } from "@prisma/client";
import { render } from "@react-email/render";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

export async function registerAction(data: RegistrationSchemaValues) {
  // ✅ Validate user input
  const parsed = registrationSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      message: "Invalid input. Please check your data.",
    };
  }

  const { email, employeeId, fullName, password, serviceId } = parsed.data;

  try {
    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // ✅ Create user (relies on unique constraints in schema)
    const user = await prisma.user.create({
      data: {
        email,
        employeeId,
        fullName,
        serviceId,
        password: hashedPassword,
        accountStatus: "PENDING",
        role: "ADMIN", // or another default role as per your schema
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        employeeId: true,
        serviceId: true,
        createdAt: true,
      },
    });

    // ✅ Create verification token (expires in 24h)
    const token = uuidv4();
    const expireOn = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    const now = new Date();
    const verificationRes = await prisma.userVerification.create({
      data: {
        userId: user.id,
        token,
        expireOn,
        createdAt: now,
        updatedAt: now,
      },
    });

    const verificationUrl =
      process.env.AUTH_URL +
      `/registration/verification/${verificationRes.token}`;

    // Render the EmailVerification component to HTML
    const emailHtml = await render(
      EmailVerification({
        userName: user.fullName as string,
        verificationUrl,
      })
    );

    // Enviar OTP por correo electrónico
    await resend.emails.send({
      from: "ScaleUp Ads Agency <support@monirhrabby.info>",
      to: [user.email as string],
      subject: `Welcome to ScaleUp Ads Agency – Please verify your email`,
      html: emailHtml,
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
