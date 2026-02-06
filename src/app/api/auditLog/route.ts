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

  const logs = await prisma.auditLog.findMany({
    where: {
      entity,
      entityId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      actor: {
        select: {
          fullName: true,
          image: true,
        },
      },
    },
  });

  return Response.json((logs as AuditLogWithActor[]) ?? []);
}
