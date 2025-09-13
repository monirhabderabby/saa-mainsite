// lib/updateSheets.ts
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
  } = options;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filters: any = {};
  if (profileId && profileId !== "All") filters.profileId = profileId;
  if (updateTo && updateTo !== "All") filters.updateTo = updateTo;

  // New filters
  if (clientName)
    filters.clientName = { contains: clientName, mode: "insensitive" };
  if (orderId) filters.orderId = { contains: orderId, mode: "insensitive" };

  // TL filter
  if (tl === "tlChecked") filters.tlId = { not: null };
  if (tl === "notTlCheck") filters.tlId = null;

  // Done filter
  if (done === "done") filters.doneById = { not: null };
  if (done === "notDone") filters.doneById = null;

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
