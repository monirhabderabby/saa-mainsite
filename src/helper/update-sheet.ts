// lib/updateSheets.ts
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function getUpdateSheets(options: {
  page?: number;
  limit?: number;
  profileId?: string;
  notTL?: boolean;
  notDone?: boolean;
}) {
  const { page = 1, limit = 10, profileId, notTL, notDone } = options;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filters: any = {};
  if (profileId) filters.profileId = profileId;
  if (notTL) filters.tlId = null;
  if (notDone) filters.doneById = null;

  const totalItems = await prisma.updateSheet.count({
    where: filters,
  });

  const totalPages = Math.ceil(totalItems / limit);

  const data = await prisma.updateSheet.findMany({
    where: filters,
    include: {
      doneBy: { select: { fullName: true, image: true } },
      tlBy: { select: { fullName: true, image: true } },
      updateBy: { select: { fullName: true, image: true } },
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
    tlBy: { select: { fullName: true; image: true } };
    doneBy: { select: { fullName: true; image: true } };
    updateBy: { select: { fullName: true; image: true } };
    profile: true;
  };
}>;
