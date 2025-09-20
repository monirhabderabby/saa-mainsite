"use server";

import prisma from "@/lib/prisma";
import {
  forgetPasswordSchema,
  ForgetPasswordType,
} from "@/schemas/auth/password-reset";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";

export async function forgetPasswordAction(data: ForgetPasswordType) {
  const parsedValue = forgetPasswordSchema.safeParse(data);

  if (!parsedValue.success) {
    return {
      success: false,
      message: "Invalid email format. Please enter a valid email address.",
    };
  }

  const user = await prisma.user.findUnique({
    where: {
      email: parsedValue.data.email,
    },
    select: {
      id: true,
    },
  });

  if (!user) {
    return {
      success: false,
      message: "No account found with this email address.",
    };
  }

  const now = new Date();

  // Check if user already has an active (not expired) link
  const existingLink = await prisma.forgetPasswordLinks.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  if (existingLink && existingLink.expireOn > now) {
    const minutesLeft = Math.ceil(
      (existingLink.expireOn.getTime() - now.getTime()) / 1000 / 60
    );

    return {
      success: false,
      message: `A reset link was already sent. Please wait ${minutesLeft} minute(s) before requesting a new one.`,
    };
  }

  // If expired, delete old record
  if (existingLink && existingLink.expireOn <= now) {
    await prisma.forgetPasswordLinks.delete({
      where: { id: existingLink.id },
    });
  }

  // Generate secure token
  const rawToken = uuidv4();
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  // Expiry time = 15 minutes
  const expireOn = new Date(Date.now() + 15 * 60 * 1000);

  // Store hashed token
  await prisma.forgetPasswordLinks.create({
    data: {
      userId: user.id,
      token: hashedToken,
      expireOn,
    },
  });

  // Build magic link with raw token
  const magicLink = `${process.env.AUTH_URL}/reset-password/${rawToken}`;
  console.log(magicLink);

  // TODO: Send email with magic link
  // await sendPasswordResetEmail(parsedValue.data.email, magicLink);

  return {
    success: true,
    message: "A password reset link has been sent to your email.",
  };
}
