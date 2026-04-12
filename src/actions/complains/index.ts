"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addComplaintManager(userId: string) {
  const existing = await prisma.complaintManager.findUnique({
    where: { userId },
  });
  if (existing) return { error: "User is already a complaint manager." };

  await prisma.complaintManager.create({ data: { userId } });
  revalidatePath("/settings/complaint-managers");
  return { success: true };
}

export async function removeComplaintManager(userId: string) {
  const existing = await prisma.complaintManager.findUnique({
    where: { userId },
  });
  if (!existing) return { error: "User is not a complaint manager." };

  await prisma.complaintManager.delete({ where: { userId } });
  revalidatePath("/settings/complaint-managers");
  return { success: true };
}

export async function isComplaintManager(userId: string) {
  const record = await prisma.complaintManager.findUnique({
    where: { userId },
  });
  return !!record;
}
