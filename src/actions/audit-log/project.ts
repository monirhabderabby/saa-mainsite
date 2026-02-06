"use server";

import { SafeProjectDto } from "@/app/api/tools/fsd-project/route";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

interface Props {
  project: SafeProjectDto;
  meta?: {
    userAgent: string;
    ip: string;
  };
}

// lib/request-info.ts

export async function createProjectLog({ project, meta }: Props) {
  const session = await auth();

  if (!session || !session.user || !session.user.id) return;

  const actorId = session.user.id;

  const actorInfo = await prisma.user.findUnique({
    where: {
      id: actorId,
    },
    select: {
      fullName: true,
    },
  });

  const projectvalue = project.monetaryValue;
  const fiverrProfile = project.profile.name;
  const projectStatus = project.status;

  const reason = `Project for ${project.clientName} created by ${
    actorInfo?.fullName ?? "Unknown user"
  }. Status: ${projectStatus}. Value: ${projectvalue}. Profile: ${fiverrProfile}.`;

  await prisma.auditLog.create({
    data: {
      entity: "project",
      entityId: project.id,
      actorId: actorId,
      action: "CREATE",
      meta: {
        projectId: project.id,
        userAgent: meta?.userAgent,
        reason: reason,
        entityTitle: project.clientName,

        orderId: project.orderId,
        profile: project.profile.name,
        status: project.status,

        // requestIInfo
        triggeredBy: "USER",
        ip: meta?.ip,
        //
      },
    },
  });
}
