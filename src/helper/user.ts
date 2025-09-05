import prisma from "@/lib/prisma";

export async function getUserByEmail(email: string) {
  const user = await prisma.user.findFirst({
    where: {
      email,
    },
  });

  return user;
}

export async function getUserById(id: string) {
  const user = await prisma.user.findFirst({
    where: {
      id,
    },
  });

  return user;
}
