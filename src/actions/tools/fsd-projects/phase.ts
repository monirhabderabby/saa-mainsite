"use server";

import prisma from "@/lib/prisma";
import {
  addProjectPhaseSchema,
  AddProjectPhaseSchema,
} from "@/schemas/tools/fsd-projects/project-phase-create";
import { ProjectPhaseStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

type ActionResponse = {
  success: boolean;
  message: string;
};

export async function createPhase(
  data: AddProjectPhaseSchema,
): Promise<ActionResponse> {
  // 1️⃣ Validate input
  const validatedData = addProjectPhaseSchema.safeParse(data);

  if (!validatedData.success) {
    return {
      success: false,
      message: "Invalid input data",
    };
  }

  const {
    projectId,
    title,
    willBeDeliver,
    orderId,
    value,
    monetaryValue,
    instructionSheet,
    status,
  } = validatedData.data;

  try {
    // 2️⃣ Create project phase
    await prisma.projectPhase.create({
      data: {
        title,
        willBeDeliver,
        orderId: orderId || undefined,
        value,
        monetaryValue,
        instructionSheet,
        status: status as ProjectPhaseStatus,
        projectId,
      },
    });

    revalidatePath(`/tools/fsd-projects/view/${projectId}`);

    return {
      success: true,
      message: "Project phase created successfully",
    };
  } catch (error) {
    console.error("Create phase error:", error);

    return {
      success: false,
      message: "Failed to create project phase",
    };
  }
}
