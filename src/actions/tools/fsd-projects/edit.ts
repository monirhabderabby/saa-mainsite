"use server";

import prisma from "@/lib/prisma";
import {
  projectCreateSchema,
  ProjectCreateSchemaType,
} from "@/schemas/tools/fsd-projects/project-create-schema";
import { Prisma, ProjectStatus } from "@prisma/client";

type ActionResponse = {
  success: boolean;
  message: string;
};

export async function editProject(
  projectId: string,
  data: ProjectCreateSchemaType,
): Promise<ActionResponse> {
  try {
    // 1) Validate input
    const validatedData = projectCreateSchema.parse(data);

    // 2) Update project
    await prisma.project.update({
      where: {
        id: projectId,
      },
      data: {
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

        // Optional fields
        delivered: validatedData.delivered ?? null,
        lastUpdate: validatedData.lastUpdate ?? null,
        nextUpdate: validatedData.nextUpdate ?? null,
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

    return {
      success: true,
      message: "Project updated successfully ✅",
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    // 🔴 Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Unique constraint (orderId)
      if (error.code === "P2002") {
        return {
          success: false,
          message: "Order ID already exists. Please use another one.",
        };
      }

      // Foreign key constraint
      if (error.code === "P2003") {
        return {
          success: false,
          message: "Invalid profile, team, or salesperson reference.",
        };
      }

      // Record not found
      if (error.code === "P2025") {
        return {
          success: false,
          message: "Project not found.",
        };
      }
    }

    // 🔴 Zod validation error
    if (error.name === "ZodError") {
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
