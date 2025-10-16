import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function getIssueSheets(options: {
  page?: number;
  limit?: number;
  profileId?: string;
  serviceId?: string;
  teamId?: string;
  clientName?: string;
  orderId?: string;
  status?: string;
  createdFrom?: string;
  createdTo?: string;
}) {
  const {
    page = 1,
    limit = 10,
    profileId,
    serviceId,
    teamId,
    clientName,
    orderId,
    status,
    createdFrom,
    createdTo,
  } = options;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filters: any = {};

  if (profileId && profileId !== "All") filters.profileId = profileId;
  if (serviceId && serviceId !== "All") filters.serviceId = serviceId;
  if (teamId && teamId !== "All") filters.teamId = teamId;
  if (clientName)
    filters.clientName = { contains: clientName, mode: "insensitive" };
  if (orderId) filters.orderId = { contains: orderId, mode: "insensitive" };
  if (status && status !== "All") {
    const statuses = status ? status.split(",") : [];
    filters.status = { in: statuses };
  }

  // CreatedAt filter
  if (
    createdFrom &&
    createdFrom !== "All" &&
    createdTo &&
    createdTo !== "All"
  ) {
    filters.createdAt = {
      gte: new Date(createdFrom),
      lte: new Date(new Date(createdTo).setHours(23, 59, 59, 999)),
    };
  } else if (
    createdFrom &&
    createdFrom !== "All" &&
    (!createdTo || createdTo === "All")
  ) {
    filters.createdAt = {
      gte: new Date(createdFrom),
      lte: new Date(), // up to right now
    };
  } else if (createdTo && createdTo !== "All") {
    filters.createdAt = {
      lte: new Date(new Date(createdTo).setHours(23, 59, 59, 999)), // include full day
    };
  }

  const totalItems = await prisma.issueSheet.count({
    where: filters,
  });

  const totalPages = Math.ceil(totalItems / limit);

  const data = await prisma.issueSheet.findMany({
    where: filters,
    include: {
      team: { select: { name: true, id: true } },
      service: { select: { name: true, id: true } },
      profile: true,
      statusChangedBy: {
        select: {
          fullName: true,
          designation: true,
          nickName: true,
        },
      },
    },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  return {
    data: data as IssueSheetData[],
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
export type GetIssueSheetsReturn = Awaited<ReturnType<typeof getIssueSheets>>;

// Type for a single IssueSheet including relations
export type IssueSheetData = Prisma.IssueSheetGetPayload<{
  include: {
    team: { select: { name: true; id: true } };
    service: { select: { name: true; id: true } };
    profile: true;
    statusChangedBy: {
      select: {
        fullName: true;
        designation: true;
        nickName: true;
      };
    };
  };
}>;
