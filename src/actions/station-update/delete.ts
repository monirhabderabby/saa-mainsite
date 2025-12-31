"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const allowedEdit = ["ADMIN", "SALES_MEMBER", "SUPER_ADMIN"] as Role[];

export async function deleteStation(id: string) {
  const cu = await auth();

  if (!cu || !cu.user || !cu.user.role) redirect("/login");

  const isActionAccess = allowedEdit.includes(cu.user.role);

  if (!isActionAccess) {
    return {
      success: false,
      message:
        "You don’t have permission to delete all stations. Please contact an administrator if you believe this is a mistake.",
    };
  }

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

export async function deleteAllStations() {
  const cu = await auth();

  if (!cu || !cu.user || !cu.user.role) redirect("/login");

  const isActionAccess = allowedEdit.includes(cu.user.role);

  if (!isActionAccess) {
    return {
      success: false,
      message:
        "You don’t have permission to delete all stations. Please contact an administrator if you believe this is a mistake.",
    };
  }

  try {
    await prisma.$transaction(async (tx) => {
      // 1️⃣ Delete all assignment profiles
      await tx.stationAssignmentProfile.deleteMany();

      // 2️⃣ Delete all assignments
      await tx.stationAssignment.deleteMany();

      // 3️⃣ Delete all stations
      await tx.stationUpdate.deleteMany();
    });

    revalidatePath("/station-update");

    return {
      success: true,
      message:
        "All stations and their related data have been successfully deleted.",
    };
  } catch (error) {
    console.error("Delete All Stations Error:", error);

    return {
      success: false,
      message:
        "Something went wrong while deleting stations. Please try again, or contact support if the problem continues.",
    };
  }
}
