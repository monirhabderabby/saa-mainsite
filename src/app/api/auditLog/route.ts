import prisma from "@/lib/prisma";
import { Entity, Prisma } from "@prisma/client";
import { NextRequest } from "next/server";

export type AuditLogWithActor = Prisma.AuditLogGetPayload<{
  include: {
    actor: {
      select: {
        fullName: true;
        image: true;
      };
    };
  };
}>;

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;

  const entity = searchParams.get("entity") as Entity;
  const entityId = searchParams.get("entityId") as string;

  // pagination params
  const page = Math.max(Number(searchParams.get("page") ?? 1), 1);
  const limit = Math.min(Number(searchParams.get("limit") ?? 5), 50);
  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where: {
        entity,
        entityId,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
      include: {
        actor: {
          select: {
            fullName: true,
            image: true,
          },
        },
      },
    }),
    prisma.auditLog.count({
      where: {
        entity,
        entityId,
      },
    }),
  ]);

  return Response.json({
    data: logs as AuditLogWithActor[],
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: skip + logs.length < total,
      hasPrevPage: page > 1,
    },
  });
}

export interface AuditLogPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface AuditLogResponse {
  data: AuditLogWithActor[];
  pagination: AuditLogPagination;
}
