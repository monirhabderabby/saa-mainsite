"use server";

import { updateProjectLog } from "@/actions/audit-log/project";
import { SafeProjectDto } from "@/app/api/tools/fsd-project/route";
import prisma from "@/lib/prisma";
import {
  projectCreateSchema,
  ProjectCreateSchemaType,
} from "@/schemas/tools/fsd-projects/project-create-schema";
import { AssignmentRole, Prisma, ProjectStatus } from "@prisma/client";
import { diff as jsonDiff } from "jsondiffpatch";
import { revalidatePath } from "next/cache";

type ActionResponse = {
  success: boolean;
  message: string;
  data?: SafeProjectDto;
};

export async function editProject(
  projectId: string,
  data: ProjectCreateSchemaType,
  meta?: {
    userAgent: string;
    ip: string;
  },
): Promise<ActionResponse> {
  try {
    // 1️⃣ Validate input
    const validatedData = projectCreateSchema.parse(data);

    // 2️⃣ Transaction (atomic update)
    const returnedData = await prisma.$transaction(async (tx) => {
      // Fetch BEFORE snapshot for audit diff (and basic include for profile name)
      const before = await tx.project.findUnique({
        where: { id: projectId },
        include: {
          profile: true,
          team: true,
          salesPerson: true,
          projectAssignments: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                },
              },
            },
          },
        },
      });

      if (!before) {
        throw new Prisma.PrismaClientKnownRequestError("Project not found", {
          code: "P2025",
          clientVersion: "unknown",
        });
      }

      // -------------------------
      // Update project fields
      // -------------------------
      const updatedProject = await tx.project.update({
        where: { id: projectId },
        data: {
          title: validatedData.title,
          shortDescription: validatedData.shortDescription,
          clientName: validatedData.clientName,
          orderId: validatedData.orderId,
          profileId: validatedData.profileId,
          salesPersonId: validatedData.salesPersonId,
          instructionSheet: validatedData.instructionSheet,
          orderDate: validatedData.orderDate,
          deadline: validatedData.deadline,
          value: validatedData.value,
          monetaryValue: validatedData.monetaryValue,
          shift: validatedData.shift,
          teamId: validatedData.teamId,
          status: (validatedData.status as ProjectStatus) ?? "NRA",

          delivered: validatedData.delivered ?? null,
          probablyWillBeDeliver: validatedData.probablyWillBeDeliver ?? null,
          lastUpdate: validatedData.lastUpdate ?? null,
          nextUpdate: validatedData.nextUpdate ?? null,
          supportPeriodStart: validatedData.supportPeriodStart ?? null,
          supportPeriodEnd: validatedData.supportPeriodEnd ?? null,
          remarkFromOperation: validatedData.remarkFromOperation ?? null,
          quickNoteFromLeader: validatedData.quickNoteFromLeader ?? null,
          review: validatedData.review ?? null,

          progressSheet: validatedData.progressSheet ?? null,
          credentialSheet: validatedData.credentialSheet ?? null,
          websiteIssueTrackerSheet:
            validatedData.websiteIssueTrackerSheet ?? null,

          userId: validatedData.userId ?? null,
        },
      });

      // -------------------------
      // Clear old assignments
      // -------------------------
      await tx.projectAssignment.deleteMany({
        where: { projectId },
      });

      // -------------------------
      // Prepare new assignments
      // -------------------------
      const assignments: Prisma.ProjectAssignmentCreateManyInput[] = [];

      validatedData.uiuxAssigned?.forEach((userId) => {
        assignments.push({
          projectId,
          userId,
          role: AssignmentRole.UIUX,
        });
      });

      validatedData.frontendAssigned?.forEach((userId) => {
        assignments.push({
          projectId,
          userId,
          role: AssignmentRole.FRONTEND,
        });
      });

      validatedData.backendAssigned?.forEach((userId) => {
        assignments.push({
          projectId,
          userId,
          role: AssignmentRole.BACKEND,
        });
      });

      // -------------------------
      // Create assignments
      // -------------------------
      if (assignments.length > 0) {
        await tx.projectAssignment.createMany({
          data: assignments,
        });
      }

      // ✅ fetch the final shape you want to return
      const full = await tx.project.findUnique({
        where: { id: updatedProject.id },
        include: {
          team: true,
          salesPerson: {
            select: {
              fullName: true,
              id: true,
              image: true,
              designation: { select: { name: true } },
            },
          },
          phase: true,
          profile: true,
          projectAssignments: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                },
              },
            },
          },
        },
      });

      if (!full) {
        throw new Prisma.PrismaClientKnownRequestError("Project not found", {
          code: "P2025",
          clientVersion: "unknown",
        });
      }

      // store it for logger call after tx
      const beforeSnap = normalizeProjectSnapshot(before);
      const afterSnap = normalizeProjectSnapshot(full);

      // logging the execution
      await logger({ beforeSnap, afterSnap, project: full, meta });

      return full!; // safe right after create
    });

    revalidatePath(`/tools/fsd-projects/view/${projectId}`);

    return {
      success: true,
      message: "Project updated successfully ✅",
      data: returnedData,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return {
          success: false,
          message: "Order ID already exists. Please use another one.",
        };
      }

      if (error.code === "P2003") {
        return {
          success: false,
          message: "Invalid reference (profile, team, user, or salesperson).",
        };
      }

      if (error.code === "P2025") {
        return {
          success: false,
          message: "Project not found.",
        };
      }
    }

    if (error?.name === "ZodError") {
      return {
        success: false,
        message: "Invalid input data. Please check your form.",
      };
    }

    console.error("Edit project error:", error);

    return {
      success: false,
      message: "Failed to update project. Please try again.",
    };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toJsonSafe(value: any): any {
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(toJsonSafe);
  if (value && typeof value === "object") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(value)) out[k] = toJsonSafe(v);
    return out;
  }
  return value;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeProjectSnapshot(project: any) {
  // Make a stable, JSON-friendly snapshot with only fields you care about
  return toJsonSafe({
    id: project.id,
    title: project.title,
    shortDescription: project.shortDescription,

    clientName: project.clientName,
    orderId: project.orderId,
    profileId: project.profileId,
    profile: project.profile?.name,
    salesPersonId: project.salesPersonId,
    salesPerson: project.salesPerson?.fullName,

    instructionSheet: project.instructionSheet,
    orderDate: project.orderDate,
    deadline: project.deadline,

    value: project.value,
    monetaryValue: project.monetaryValue,
    shift: project.shift,
    teamId: project.teamId,
    team: project.team?.name,
    status: project.status,

    delivered: project.delivered,
    probablyWillBeDeliver: project.probablyWillBeDeliver,

    supportPeriodStart: project.supportPeriodStart,
    supportPeriodEnd: project.supportPeriodEnd,

    lastUpdate: project.lastUpdate,
    nextUpdate: project.nextUpdate,

    remarkFromOperation: project.remarkFromOperation,
    quickNoteFromLeader: project.quickNoteFromLeader,
    review: project.review,

    progressSheet: project.progressSheet,
    credentialSheet: project.credentialSheet,
    websiteIssueTrackerSheet: project.websiteIssueTrackerSheet,

    userId: project.userId,

    // Normalize assignments as role -> sorted user names (not IDs)
    assignments: (() => {
      const map: Record<string, string[]> = {};
      for (const a of project.projectAssignments ?? []) {
        if (!map[a.role]) map[a.role] = [];
        // Store user's full name instead of ID for readable logs
        const userName = a.user?.fullName || a.userId;
        map[a.role].push(userName);
      }
      // Sort for consistent comparison
      for (const k of Object.keys(map)) map[k] = map[k].sort();
      return map;
    })(),
  });
}

// log configuration function

interface LoggerProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  beforeSnap: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  afterSnap: any;
  project: SafeProjectDto;
  meta?: {
    userAgent?: string;
    ip?: string;
  };
}

/**
 * Normalizes assignment changes from jsondiffpatch format
 * to simple [from, to] array format
 */
function normalizeAssignmentChanges(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  assignmentDiff: Record<string, any>,
  beforeAssignments: Record<string, string[]>,
  afterAssignments: Record<string, string[]>,
): Record<string, [string[], string[]]> | null {
  const normalized: Record<string, [string[], string[]]> = {};

  // Get all unique roles from both before and after
  const allRoles = new Set([
    ...Object.keys(beforeAssignments),
    ...Object.keys(afterAssignments),
  ]);

  // Check each role for actual changes
  for (const role of Array.from(allRoles)) {
    const beforeList = (beforeAssignments[role] || []).sort();
    const afterList = (afterAssignments[role] || []).sort();

    // Only include if there's an actual difference
    const beforeStr = JSON.stringify(beforeList);
    const afterStr = JSON.stringify(afterList);

    if (beforeStr !== afterStr) {
      normalized[role] = [beforeList, afterList];
    }
  }

  return Object.keys(normalized).length > 0 ? normalized : null;
}

/**
 * Main normalize function for all changes
 */
async function normalizeChanges(
  changes: Record<string, unknown>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  beforeSnap: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  afterSnap: any,
): Promise<Record<string, unknown>> {
  const normalized = { ...changes };

  // Handle assignment changes specially
  if (normalized.assignments && typeof normalized.assignments === "object") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const assignmentDiff = normalized.assignments as Record<string, any>;

    // Get before and after assignment states from snapshots
    const beforeAssignments = beforeSnap.assignments || {};
    const afterAssignments = afterSnap.assignments || {};

    // Normalize the assignment changes
    const normalizedAssignments = normalizeAssignmentChanges(
      assignmentDiff,
      beforeAssignments,
      afterAssignments,
    );

    if (normalizedAssignments) {
      normalized.assignments = normalizedAssignments;
    } else {
      delete normalized.assignments;
    }
  }

  // Handle other field resolvers (team, profile, salesPerson)
  for (const [field, resolver] of Object.entries(FIELD_RESOLVERS)) {
    if (field in normalized) {
      const resolved = await resolver(normalized[field]);
      if (resolved) {
        delete normalized[field];
        normalized[resolved.field] = resolved.value;
      }
    }
  }

  return normalized;
}

type ResolverResult = {
  field: string;
  value: unknown;
};

type FieldResolver = (tuple: unknown) => Promise<ResolverResult | null>;

// Put all "foreign key → human readable" mappings here
const FIELD_RESOLVERS: Record<string, FieldResolver> = {
  teamId: async (tuple: unknown) => {
    if (!Array.isArray(tuple) || tuple.length < 2) return null;

    const [from, to] = tuple as [string | null, string | null];

    const ids = [from, to].filter(Boolean) as string[];
    if (ids.length === 0) {
      return { field: "team", value: [null, null] };
    }

    const teams = await prisma.team.findMany({
      where: { id: { in: ids } },
      select: { id: true, name: true },
    });

    const map = Object.fromEntries(teams.map((t) => [t.id, t.name]));

    return {
      field: "team",
      value: [
        from ? (map[from] ?? "Unknown team") : null,
        to ? (map[to] ?? "Unknown team") : null,
      ],
    };
  },
  profileId: async (tuple: unknown) => {
    if (!Array.isArray(tuple) || tuple.length < 2) return null;

    const [from, to] = tuple as [string | null, string | null];

    const ids = [from, to].filter(Boolean) as string[];
    if (ids.length === 0) {
      return { field: "profile", value: [null, null] };
    }

    const profiles = await prisma.profile.findMany({
      where: { id: { in: ids } },
      select: { id: true, name: true },
    });

    const map = Object.fromEntries(profiles.map((t) => [t.id, t.name]));

    return {
      field: "profile",
      value: [
        from ? (map[from] ?? "Unknown profile") : null,
        to ? (map[to] ?? "Unknown profile") : null,
      ],
    };
  },
  salesPersonId: async (tuple: unknown) => {
    if (!Array.isArray(tuple) || tuple.length < 2) return null;

    const [from, to] = tuple as [string | null, string | null];

    const ids = [from, to].filter(Boolean) as string[];
    if (ids.length === 0) {
      return { field: "salesPerson", value: [null, null] };
    }

    const persons = await prisma.user.findMany({
      where: { id: { in: ids } },
      select: { id: true, fullName: true },
    });

    const map = Object.fromEntries(persons.map((t) => [t.id, t.fullName]));

    return {
      field: "salesPerson",
      value: [
        from ? (map[from] ?? "Unknown person") : null,
        to ? (map[to] ?? "Unknown person") : null,
      ],
    };
  },
};

export async function logger({
  beforeSnap,
  afterSnap,
  project,
  meta,
}: LoggerProps) {
  let logChanges = (jsonDiff(beforeSnap, afterSnap) ?? null) as Record<
    string,
    unknown
  > | null;

  if (logChanges) {
    logChanges = await normalizeChanges(logChanges, beforeSnap, afterSnap);
  }

  // Debug logging
  if (logChanges?.assignments) {
    console.log("=== ASSIGNMENT DEBUG ===");
    console.log(
      "Before assignments:",
      JSON.stringify(beforeSnap.assignments, null, 2),
    );
    console.log(
      "After assignments:",
      JSON.stringify(afterSnap.assignments, null, 2),
    );
    console.log(
      "Normalized assignments:",
      JSON.stringify(logChanges.assignments, null, 2),
    );
    console.log("=======================");
  }

  await updateProjectLog({
    project,
    changes: (logChanges as Prisma.JsonValue) ?? null,
    meta: {
      userAgent: meta?.userAgent ?? "",
      ip: meta?.ip ?? "",
    },
  });
}
