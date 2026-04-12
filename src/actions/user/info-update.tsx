// actions/update-user-info.ts
"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { EmployeeStatus, Role } from "@prisma/client";
import { revalidatePath } from "next/cache";

const allowedToUpdate = ["ADMIN", "SUPER_ADMIN"] as Role[];

interface UpdateUserInfoProps {
  id: string;
  fullName?: string;
  nickName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: Date | null;
  parmanentAddress?: string;
  presentAddress?: string;
  employeeStatus?: EmployeeStatus;
  designationId?: string;
  departmentId?: string;
  serviceId?: string;
}

export async function updateUserInfo({ id, ...data }: UpdateUserInfoProps) {
  const session = await auth();

  if (!session || !session.user) {
    return {
      success: false,
      message: "You must be logged in to perform this action.",
    };
  }

  if (!allowedToUpdate.includes(session.user.role as Role)) {
    return {
      success: false,
      message: "You don't have permission to update user info.",
    };
  }

  const existUser = await prisma.user.findFirst({ where: { id } });

  if (!existUser) {
    return { success: false, message: "User not found." };
  }

  if (session.user.role === "ADMIN" && existUser.role === "SUPER_ADMIN") {
    return {
      success: false,
      message: "You cannot update a SUPER ADMIN.",
    };
  }

  // Check uniqueness for email/nickName if changed
  if (data.email && data.email !== existUser.email) {
    const emailTaken = await prisma.user.findFirst({
      where: { email: data.email, NOT: { id } },
    });
    if (emailTaken) return { success: false, message: "Email already in use." };
  }

  if (data.nickName && data.nickName !== existUser.nickName) {
    const nickTaken = await prisma.user.findFirst({
      where: { nickName: data.nickName, NOT: { id } },
    });
    if (nickTaken)
      return { success: false, message: "Nick name already in use." };
  }

  const user = await prisma.user.update({
    where: { id },
    data: {
      ...data,
      updatedAt: new Date(),
    },
  });

  revalidatePath("/employees");

  return {
    success: true,
    message: "User info updated successfully.",
    user,
  };
}
