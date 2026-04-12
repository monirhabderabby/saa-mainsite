import prisma from "@/lib/prisma";

export async function getComplaintManagers() {
  return prisma.complaintManager.findMany({
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          image: true,
          employeeId: true,
          designation: { select: { name: true } },
          department: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAllUsersNotManagers() {
  const managers = await prisma.complaintManager.findMany({
    select: { userId: true },
  });
  const managerIds = managers.map((m) => m.userId);

  return prisma.user.findMany({
    where: { id: { notIn: managerIds } },
    select: {
      id: true,
      fullName: true,
      email: true,
      image: true,
      employeeId: true,
      designation: { select: { name: true } },
      department: { select: { name: true } },
    },
    orderBy: { fullName: "asc" },
  });
}
