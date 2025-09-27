// lib/updateSheets.ts
import { getDayRange } from "@/lib/date";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function getUpdateSheets(options: {
  page?: number;
  limit?: number;
  profileId?: string;
  updateTo?: string;
  clientName?: string;
  orderId?: string;
  tl?: "tlChecked" | "notTlCheck" | "All";
  done?: "done" | "notDone" | "All";
  createdFrom?: string; // ISO date string
  createdTo?: string; // ISO date string
  sendFrom?: string; // ISO date string
  sendTo?: string; // ISO date string
}) {
  const {
    page = 1,
    limit = 10,
    profileId,
    updateTo,
    clientName,
    orderId,
    tl = "All",
    done = "All",
    createdFrom,
    createdTo,
    sendFrom,
    sendTo,
  } = options;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filters: any = {};

  if (profileId && profileId !== "All") filters.profileId = profileId;
  if (updateTo && updateTo !== "All") filters.updateTo = updateTo;
  if (clientName)
    filters.clientName = { contains: clientName, mode: "insensitive" };

  if (orderId) filters.orderId = { contains: orderId, mode: "insensitive" };

  // TL filter
  if (tl === "tlChecked") filters.tlId = { not: null };
  if (tl === "notTlCheck") filters.tlId = { equals: null };

  // Done filter
  if (done === "done") filters.doneById = { not: null };
  if (done === "notDone") filters.doneById = { equals: null };

  // Created At Filters
  if (
    createdFrom &&
    createdFrom !== "All" &&
    createdTo &&
    createdTo !== "All"
  ) {
    filters.createdAt = {
      gte: new Date(createdFrom),
      lte: new Date(createdTo),
    };
  } else if (
    createdFrom &&
    createdFrom !== "All" &&
    (!createdTo || createdTo === "All")
  ) {
    const { start, end } = getDayRange(createdFrom);
    filters.createdAt = { gte: start, lte: end };
  } else if (
    (!createdFrom || createdFrom === "All") &&
    createdTo &&
    createdTo !== "All"
  ) {
    filters.createdAt = { lte: new Date(createdTo) };
  }

  // SendAt filter
  if (sendFrom && sendFrom !== "All" && sendTo && sendTo !== "All") {
    filters.sendAt = { gte: new Date(sendFrom), lte: new Date(sendTo) };
  } else if (sendFrom && sendFrom !== "All" && (!sendTo || sendTo === "All")) {
    const { start, end } = getDayRange(sendFrom);
    filters.sendAt = { gte: start, lte: end };
  } else if ((!sendFrom || sendFrom === "All") && sendTo && sendTo !== "All") {
    filters.sendAt = { lte: new Date(sendTo) };
  }

  const totalItems = await prisma.updateSheet.count({
    where: filters,
  });

  const totalPages = Math.ceil(totalItems / limit);

  const data = await prisma.updateSheet.findMany({
    where: filters,
    include: {
      doneBy: {
        select: {
          fullName: true,
          image: true,
          designation: true,
          nickName: true,
        },
      },
      tlBy: {
        select: {
          fullName: true,
          image: true,
          designation: true,
          nickName: true,
        },
      },
      updateBy: {
        include: {
          userTeams: true,
          service: true,
          designation: true,
        },
      },
      profile: true,
    },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  return {
    data: data as UpdateSheetData[],
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
export type GetUpdateSheetsReturn = Awaited<ReturnType<typeof getUpdateSheets>>;

// Type for a single UpdateSheet including the relations
export type UpdateSheetData = Prisma.UpdateSheetGetPayload<{
  include: {
    tlBy: {
      select: {
        fullName: true;
        image: true;
        designation: true;
        nickName: true;
      };
    };
    doneBy: {
      select: {
        fullName: true;
        image: true;
        designation: true;
        nickName: true;
      };
    };
    updateBy: {
      include: {
        userTeams: true;
        service: true;
        designation: true;
      };
    };
    profile: true;
  };
}>;
