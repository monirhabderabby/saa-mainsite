import { AccountStatus, Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export type GetUsersParams = {
  page?: number;
  limit?: number;
  searchQuery?: string;
  serviceId?: string;
  teamId?: string;
  accountStatus?: AccountStatus;
};

export async function getUsers(params: GetUsersParams = {}) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const skip = (page - 1) * limit;

  const where: Prisma.UserWhereInput = {};

  if (params.searchQuery) {
    where.OR = [
      { employeeId: { contains: params.searchQuery, mode: "insensitive" } },
      { fullName: { contains: params.searchQuery, mode: "insensitive" } },
      { email: { contains: params.searchQuery, mode: "insensitive" } },
    ];
  }

  if (params.serviceId && params.serviceId !== "All") {
    where.serviceId = params.serviceId;
  }

  if (params.teamId && params.teamId !== "All") {
    where.userTeams = { some: { teamId: params.teamId } };
  }

  // Add accountStatus filter
  if (params.accountStatus) {
    where.accountStatus = params.accountStatus;
  }

  const totalItems = await prisma.user.count({ where });
  const totalPages = Math.ceil(totalItems / limit);

  const data: UsersData[] = await prisma.user.findMany({
    skip,
    take: limit,
    where,
    include: {
      service: true,
      permissions: true,
      designation: true,
      userTeams: { include: { team: true } },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return {
    data,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems,
      pageSize: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
    success: true,
  };
}

// Export the return type
export type GetUsersReturnData = Awaited<ReturnType<typeof getUsers>>;

// Type for a single UpdateSheet including the relations
export type UsersData = Prisma.UserGetPayload<{
  include: {
    service: true;
    permissions: true;
    designation: true;
    userTeams: {
      include: {
        team: true;
      };
    };
  };
}>;
