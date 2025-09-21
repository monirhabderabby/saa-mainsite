import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export type GetUsersParams = {
  page?: number;
  limit?: number;
  name?: string;
  designationId?: string;
  serviceId?: string;
  teamId?: string;
};

export async function getUsers(params: GetUsersParams = {}) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const skip = (page - 1) * limit;

  const where: Prisma.UserWhereInput = {};

  if (params.name) {
    where.fullName = { contains: params.name, mode: "insensitive" };
  }

  if (params.designationId) {
    where.designationId = params.designationId;
  }

  if (params.serviceId) {
    where.serviceId = params.serviceId;
  }

  if (params.teamId) {
    where.userTeams = { some: { teamId: params.teamId } };
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
