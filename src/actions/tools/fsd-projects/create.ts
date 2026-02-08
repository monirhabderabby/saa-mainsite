"use server";

import { createProjectLog } from "@/actions/audit-log/project";
import { SafeProjectDto } from "@/app/api/tools/fsd-project/route";
import { auth } from "@/auth"; // adjust if you use next-auth or custom auth
import prisma from "@/lib/prisma";
import {
  projectCreateSchema,
  ProjectCreateSchemaType,
} from "@/schemas/tools/fsd-projects/project-create-schema";
import { AssignmentRole, Prisma } from "@prisma/client";

type ActionResponse = {
  success: boolean;
  message: string;
  data?: SafeProjectDto;
};

export async function createProject(
  data: ProjectCreateSchemaType,
  meta?: {
    userAgent: string;
    ip: string;
  },
): Promise<ActionResponse> {
  try {
    // ----------------------------------
    // 1. Authorization
    // ----------------------------------
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        message: "Unauthorized request.",
      };
    }

    // calculating next update
    const nextUpdate = new Date();
    nextUpdate.setDate(nextUpdate.getDate() + 2);

    // ----------------------------------
    // 2. Validate input
    // ----------------------------------
    const validatedData = projectCreateSchema.parse(data);

    // ----------------------------------
    // 3. Transaction
    // ----------------------------------
    const returnedData = await prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
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

          // Optional fields
          delivered: validatedData.delivered ?? null,
          probablyWillBeDeliver: validatedData.probablyWillBeDeliver ?? null,
          lastUpdate: validatedData.lastUpdate ?? null,
          nextUpdate: validatedData.nextUpdate ?? nextUpdate,
          remarkFromOperation: validatedData.remarkFromOperation ?? null,
          quickNoteFromLeader: validatedData.quickNoteFromLeader ?? null,
          review: validatedData.review ?? null,
          progressSheet: validatedData.progressSheet ?? null,
          credentialSheet: validatedData.credentialSheet ?? null,
          websiteIssueTrackerSheet:
            validatedData.websiteIssueTrackerSheet ?? null,

          // Always trust server identity
          userId: session.user.id,
        },
      });

      // ----------------------------------
      // 4. Build assignments safely
      // ----------------------------------
      const assignments: Prisma.ProjectAssignmentCreateManyInput[] = [];
      const seen = new Set<string>();

      const pushAssignment = (userId: string, role: AssignmentRole) => {
        const key = `${userId}-${role}`;
        if (seen.has(key)) return;
        seen.add(key);

        assignments.push({
          projectId: project.id,
          userId,
          role,
        });
      };

      validatedData.uiuxAssigned?.forEach((userId) =>
        pushAssignment(userId, AssignmentRole.UIUX),
      );

      validatedData.frontendAssigned?.forEach((userId) =>
        pushAssignment(userId, AssignmentRole.FRONTEND),
      );

      validatedData.backendAssigned?.forEach((userId) =>
        pushAssignment(userId, AssignmentRole.BACKEND),
      );

      // ----------------------------------
      // 5. Create assignments
      // ----------------------------------
      if (assignments.length > 0) {
        await tx.projectAssignment.createMany({
          data: assignments,
        });
      }

      // ✅ fetch the final shape you want to return
      const full = await tx.project.findUnique({
        where: { id: project.id },
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
          projectAssignments: true,
        },
      });

      return full!; // safe right after create
    });

    // ----------------------------------
    // 6. Audit log
    // ----------------------------------

    await createProjectLog({ project: returnedData, meta });

    return {
      success: true,
      message: "Project created successfully ✅",
      data: returnedData,
    };
  } catch (error: unknown) {
    // ----------------------------------
    // Prisma errors
    // ----------------------------------
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
          message: "Invalid profile, team, or salesperson reference.",
        };
      }
    }

    // ----------------------------------
    // Zod validation errors
    // ----------------------------------
    if (error instanceof Error && error.name === "ZodError") {
      return {
        success: false,
        message: "Invalid input data. Please check your form.",
      };
    }

    // ----------------------------------
    // Unknown error
    // ----------------------------------
    console.error("Create project failed", {
      orderId: data?.orderId,
      error,
    });

    return {
      success: false,
      message: "Failed to create project. Please try again.",
    };
  }
}
