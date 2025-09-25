"use server";

import prisma from "@/lib/prisma";

export async function checkNickNameAction(nickName: string) {
  if (!nickName) {
    return { success: false, message: "Nickname is required" };
  }

  const exists = await prisma.user.findUnique({
    where: { nickName },
  });

  if (exists) {
    return { success: false, message: "This nickname is already taken" };
  }

  return { success: true, message: "Nickname is available" };
}
