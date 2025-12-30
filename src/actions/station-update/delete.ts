"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteStation(id: string) {
  try {
    await prisma.$transaction(async (tx) => {
      // 1️⃣ Delete assignment profiles linked to assignments for this station
      await tx.stationAssignmentProfile.deleteMany({
        where: {
          assignment: { stationId: id },
        },
      });

      // 2️⃣ Delete assignments for this station
      await tx.stationAssignment.deleteMany({
        where: { stationId: id },
      });

      // 3️⃣ Delete the station itself
      await tx.stationUpdate.delete({
        where: { id },
      });
    });

    revalidatePath("/station-update");

    return {
      success: true,
      message: "Station deleted successfully",
    };
  } catch (error) {
    console.error("Delete Station Error:", error);

    return {
      success: false,
      message: "Failed to delete station",
    };
  }
}
