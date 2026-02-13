"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

type ActionResponse = {
  success: boolean;
  message: string;
};

export async function deleteProject(
  projectId: string,
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

    // ----------------------------------
    // 2. Delete Operation
    // ----------------------------------
    // Note: This relies on your Prisma Schema having "onDelete: Cascade"
    // on the ProjectAssignment relation. If not, assignments must be deleted first.
    await prisma.project.delete({
      where: {
        id: projectId,
      },
    });

    // ----------------------------------
    // 3. Cache revalidation
    // ----------------------------------

    await prisma.auditLog.deleteMany({
      where: {
        entity: "project",
        entityId: projectId,
      },
    });

    return {
      success: true,
      message: "Project deleted successfully 🗑️",
    };
  } catch (error: unknown) {
    // ----------------------------------
    // Prisma errors
    // ----------------------------------
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // P2025: Record to delete does not exist
      if (error.code === "P2025") {
        return {
          success: false,
          message: "Project not found or already deleted.",
        };
      }

      // P2003: Foreign key constraint failed (if cascading delete is not set up)
      if (error.code === "P2003") {
        return {
          success: false,
          message:
            "Cannot delete project because it has related assignments/records.",
        };
      }
    }

    // ----------------------------------
    // Unknown error
    // ----------------------------------
    console.error("Delete project failed", {
      projectId,
      error,
    });

    return {
      success: false,
      message: "Failed to delete project. Please try again.",
    };
  }
}
