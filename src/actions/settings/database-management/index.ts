"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import {
  databaseManagementFormSchema,
  DatabaseManagementFormSchemaType,
} from "@/schemas/settings/database-management";

export async function deleteDatabaseDataBasedonSchema(
  data: DatabaseManagementFormSchemaType
) {
  const cu = await auth();

  if (!cu || !cu.user || !cu.user.id) {
    return {
      success: false,
      message: "Unauthorized: user not found.",
    };
  }

  if (cu.user.role !== "SUPER_ADMIN") {
    return {
      success: false,
      message: "Unauthorized: only super admins can perform this action.",
    };
  }

  const parsedValue = databaseManagementFormSchema.safeParse(data);

  if (!parsedValue.success) {
    return {
      success: false,
      message: "Invalid form data.",
      errors: parsedValue.error.flatten().fieldErrors,
    };
  }

  const { collection, startDate, endDate } = parsedValue.data;

  // Start of the day (00:00:00)
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  // End of the day (23:59:59.999)
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  try {
    let result;

    if (collection === "updateSheet") {
      result = await prisma.updateSheet.deleteMany({
        where: {
          createdAt: {
            gte: start,
            lte: end,
          },
        },
      });
    } else if (collection === "issueSheet") {
      result = await prisma.issueSheet.deleteMany({
        where: {
          createdAt: {
            gte: start,
            lte: end,
          },
        },
      });
    } else {
      return {
        success: false,
        message: "Invalid collection name.",
      };
    }

    return {
      success: true,
      message: `Deleted ${result.count} records from "${collection}" between ${startDate.toDateString()} and ${endDate.toDateString()}.`,
    };
  } catch (error) {
    console.error("Error deleting records:", error);

    return {
      success: false,
      message: "An error occurred while deleting records.",
    };
  }
}
