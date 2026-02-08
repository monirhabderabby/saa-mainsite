"use server";

import prisma from "@/lib/prisma";
import { StationFormValues } from "@/schemas/station-update";
import { revalidatePath } from "next/cache";

export async function updateStationUpdate(id: string, data: StationFormValues) {
  try {
    if (!data.assignments.length) {
      return {
        success: false,
        message: "At least one assignment is required",
      };
    }

    await prisma.$transaction(async (tx) => {
      // 1️⃣ Update station fields
      await tx.stationUpdate.update({
        where: { id },
        data: {
          shift: data.shift,
          title: data.title,
        },
      });

      // 2️⃣ Delete existing assignment profiles
      await tx.stationAssignmentProfile.deleteMany({
        where: {
          assignment: { stationId: id },
        },
      });

      // 3️⃣ Delete existing assignments
      await tx.stationAssignment.deleteMany({
        where: { stationId: id },
      });

      // 4️⃣ Re-create assignments + profile mappings
      for (const assignment of data.assignments) {
        const createdAssignment = await tx.stationAssignment.create({
          data: {
            stationId: id,
            userId: assignment.userId,
          },
        });

        await tx.stationAssignmentProfile.createMany({
          data: assignment.profiles.map((profileId) => ({
            assignmentId: createdAssignment.id,
            profileId,
          })),
        });
      }
    });

    revalidatePath("/station-update");

    return {
      success: true,
      message: "Station update updated successfully",
    };
  } catch (error) {
    console.error("Update Station Update Error:", error);

    return {
      success: false,
      message: "Failed to update station update",
      error: error,
    };
  }
}
