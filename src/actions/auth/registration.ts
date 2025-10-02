"use server";

import { EmailVerification } from "@/email-templates/email-verification";
import prisma from "@/lib/prisma";
import { resend } from "@/lib/resend";
import {
  registrationSchema,
  RegistrationSchemaValues,
} from "@/schemas/auth/registration";
import arcjet, { request, validateEmail } from "@arcjet/next";
import { Prisma, Role } from "@prisma/client";
import { render } from "@react-email/render";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

const aj = arcjet({
  key: process.env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com
  rules: [
    validateEmail({
      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
      // block disposable, invalid, and email addresses with no MX records
      deny: ["DISPOSABLE", "INVALID", "NO_MX_RECORDS"],
    }),
  ],
});

export async function registerAction(data: RegistrationSchemaValues) {
  const req = await request();
  // ✅ Validate user input
  const parsed = registrationSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      message: "Invalid input. Please check your data.",
    };
  }

  const {
    email,
    employeeId,
    fullName,
    password,
    serviceId,
    designationId,
    departmentId,
    nickName,
  } = parsed.data;

  // check email validity with arcjet
  const decision = await aj.protect(req, {
    email,
  });

  if (decision.isDenied()) {
    return {
      success: false,
      message:
        "The email address you entered cannot be used. Please try a valid, non-disposable email.",
    };
  }

  try {
    // ✅ Pre-check if email or employeeId already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { employeeId }],
      },
      select: { email: true, employeeId: true },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return { success: false, message: "Email already in use." };
      }
      if (existingUser.employeeId === employeeId) {
        return { success: false, message: "Employee ID already in use." };
      }
    }

    const department = await prisma.department.findUnique({
      where: {
        id: departmentId,
      },
      select: {
        name: true,
      },
    });

    if (!department) {
      return {
        success: false,
        message: "department not found",
      };
    }

    const { name: departmentName } = department;
    const role =
      departmentName === "Sales"
        ? "SALES_MEMBER"
        : ("OPERATION_MEMBER" as Role);
    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.$transaction(async (tx) => {
      // ✅ Create user (relies on unique constraints in schema)
      const user = await tx.user.create({
        data: {
          email,
          employeeId,
          fullName,
          serviceId,
          password: hashedPassword,
          accountStatus: "PENDING",
          role:
            departmentName === "Sales" ? "SALES_MEMBER" : "OPERATION_MEMBER", // or another default role as per your schema
          designationId,
          departmentId,
          nickName,
        },
        select: {
          id: true,
          email: true,
          fullName: true,
          employeeId: true,
          serviceId: true,
          createdAt: true,
          departmentId: true,
        },
      });

      // ✅ Create verification token (expires in 24h)
      const token = uuidv4();
      const expireOn = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

      const now = new Date();
      const verificationRes = await tx.userVerification.create({
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

      await resend.emails.send({
        from: "ScaleUp Ads Agency <support@scaleupdevagency.com>",
        to: [user.email as string],
        subject: `Welcome to ScaleUp Ads Agency – Please verify your email`,
        html: emailHtml,
      });

      // create permissions in a single operation
      await tx.permissions.createMany({
        data: [
          {
            name: "ISSUE_SHEET",
            userId: user.id,
            isIssueCreateAllowed: role === "SALES_MEMBER" ? true : undefined,
          },
          {
            name: "UPDATE_SHEET",
            userId: user.id,
            isMessageCreateAllowed:
              role === "OPERATION_MEMBER" ? true : undefined,
          },
        ],
      });

      return user;
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
