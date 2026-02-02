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

export async function updatePhase(
  phaseId: string,
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
    // 2️⃣ Update project phase
    await prisma.projectPhase.update({
      where: {
        id: phaseId,
      },
      data: {
        title,
        willBeDeliver,
        orderId: orderId || undefined,
        value,
        monetaryValue,
        instructionSheet,
        status: status as ProjectPhaseStatus,
      },
    });

    // 3️⃣ Revalidate project view
    revalidatePath(`/tools/fsd-projects/view/${projectId}`);

    return {
      success: true,
      message: "Project phase updated successfully",
    };
  } catch (error) {
    console.error("Update phase error:", error);

    return {
      success: false,
      message: "Failed to update project phase",
    };
  }
}

export async function deletePhase(
  phaseId: string,
  projectId: string,
): Promise<ActionResponse> {
  if (!phaseId || !projectId) {
    return {
      success: false,
      message: "Missing required parameters",
    };
  }

  try {
    // 1️⃣ Delete project phase
    await prisma.projectPhase.delete({
      where: {
        id: phaseId,
      },
    });

    // 2️⃣ Revalidate project view
    revalidatePath(`/tools/fsd-projects/view/${projectId}`);

    return {
      success: true,
      message: "Project phase deleted successfully",
    };
  } catch (error) {
    console.error("Delete phase error:", error);

    return {
      success: false,
      message: "Failed to delete project phase",
    };
  }
}
