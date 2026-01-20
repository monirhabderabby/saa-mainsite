"use server";

import prisma from "@/lib/prisma";
import {
  projectCreateSchema,
  ProjectCreateSchemaType,
} from "@/schemas/tools/fsd-projects/project-create-schema";

import { Prisma } from "@prisma/client";

type ActionResponse = {
  success: boolean;
  message: string;
};

export async function createProject(
  data: ProjectCreateSchemaType,
): Promise<ActionResponse> {
  try {
    // 1) Validate input
    const validatedData = projectCreateSchema.parse(data);

    // 2) Create project in database
    await prisma.project.create({
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
      message: "Project created successfully ✅",
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    // Handle unique constraint error for orderId
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

    // Handle Zod validation errors
    if (error.name === "ZodError") {
      return {
        success: false,
        message: "Invalid input data. Please check your form.",
      };
    }

    // Fallback error
    console.error("Create project error:", error);

    return {
      success: false,
      message: "Failed to create project. Please try again.",
    };
  }
}
