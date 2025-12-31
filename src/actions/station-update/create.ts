"use server";

import prisma from "@/lib/prisma";
import { StationFormValues } from "@/schemas/station-update";
import { revalidatePath } from "next/cache";

export async function createStationUpdate(data: StationFormValues) {
  try {
    // Basic guard (Zod already validates, this is defensive)
    if (!data.assignments.length) {
      return {
        success: false,
        message: "At least one assignment is required",
      };
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1️⃣ Create Station
      const station = await tx.stationUpdate.create({
        data: {
          shift: data.shift,
          title: data.title,
        },
      });

      // 2️⃣ Create assignments + profile mappings
      for (const assignment of data.assignments) {
        const createdAssignment = await tx.stationAssignment.create({
          data: {
            stationId: station.id,
            userId: assignment.userId,
          },
        });

        // 3️⃣ Create join records (Assignment ↔ Profiles)
        await tx.stationAssignmentProfile.createMany({
          data: assignment.profiles.map((profileId) => ({
            assignmentId: createdAssignment.id,
            profileId,
          })),
        });
      }

      return station;
    });

    // Optional: revalidate page/cache
    revalidatePath("/station-updates");

    return {
      success: true,
      message: "Station update successfully",
      data: result,
    };
  } catch (error) {
    console.error("Create Station Update Error:", error);

    return {
      success: false,
      message: "Failed to create station update",
    };
  }
}
