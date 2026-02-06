"use server";

import { SafeProjectDto } from "@/app/api/tools/fsd-project/route";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

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

interface UpdateProps {
  project: SafeProjectDto;
  changes?: Prisma.JsonValue; // <- no unknown
  meta?: {
    userAgent: string;
    ip: string;
  };
}

export async function updateProjectLog({
  project,
  changes,
  meta,
}: UpdateProps) {
  const session = await auth();
  if (!session?.user?.id) return;

  const actorId = session.user.id;

  const actorInfo = await prisma.user.findUnique({
    where: { id: actorId },
    select: { fullName: true },
  });

  const projectValue = project.monetaryValue;
  const fiverrProfile = project.profile?.name;
  const projectStatus = project.status;

  const changedKeys = changes ? Object.keys(changes) : [];
  const changedKeysText =
    changedKeys.length > 0 ? changedKeys.join(", ") : "Unknown fields";

  const reason = `Project for ${project.clientName} updated by ${
    actorInfo?.fullName ?? "Unknown user"
  }. Status: ${projectStatus}. Value: ${projectValue}. Profile: ${
    fiverrProfile ?? "N/A"
  }. Changed: ${changedKeysText}.`;

  await prisma.auditLog.create({
    data: {
      entity: "project",
      entityId: project.id,
      actorId,
      action: "UPDATE",
      // Your schema supports this; keep it structured so you can diff later.
      changes: (changes as Prisma.JsonObject) ?? null,
      meta: {
        projectId: project.id,
        userAgent: meta?.userAgent,
        reason,
        entityTitle: project.clientName,

        orderId: project.orderId,
        profile: project.profile?.name,
        status: project.status,

        triggeredBy: "USER",
        ip: meta?.ip,
      },
    },
  });
}

type ChangeValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | string[]
  | number[]
  | boolean[]
  | object;

export type ProjectChanges = Record<
  string,
  {
    from: ChangeValue;
    to: ChangeValue;
  }
>;

// Build role -> sorted userIds from ProjectAssignment[]
export async function normalizeAssignments(
  assignments: Array<{ role: string; userId: string }>,
) {
  const map: Record<string, string[]> = {};
  for (const a of assignments) {
    if (!map[a.role]) map[a.role] = [];
    map[a.role].push(a.userId);
  }
  for (const k of Object.keys(map)) map[k] = map[k].sort();
  return map;
}

// Build role -> sorted userIds from validated form data arrays
export async function normalizeAssignmentsFromInput(input: {
  uiuxAssigned?: string[];
  frontendAssigned?: string[];
  backendAssigned?: string[];
}) {
  return {
    UIUX: (input.uiuxAssigned ?? []).slice().sort(),
    FRONTEND: (input.frontendAssigned ?? []).slice().sort(),
    BACKEND: (input.backendAssigned ?? input.backendAssigned ?? [])
      .slice()
      .sort(), // safe fallback
  } as Record<string, string[]>;
}
