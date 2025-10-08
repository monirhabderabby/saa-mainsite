"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";

interface Props {
  note: string;
  messageId: string;
}

const allowedSalesNoteRoles = ["ADMIN", "SUPER_ADMIN", "SALES_MEMBER"];

export async function AddSalesNote({ note, messageId }: Props) {
  try {
    const cu = await auth();

    // 🔒 Check authentication
    if (!cu || !cu.user || !cu.user.id) {
      return {
        success: false,
        message: "You must be signed in to add a sales note.",
      };
    }

    // 🧩 Check role authorization
    if (!allowedSalesNoteRoles.includes(cu.user.role)) {
      return {
        success: false,
        message: "You don’t have permission to add sales notes.",
      };
    }

    // 🔍 Verify that the target update sheet exists
    const updateSheet = await prisma.updateSheet.findUnique({
      where: { id: messageId },
    });

    if (!updateSheet) {
      return {
        success: false,
        message: "The requested update sheet could not be found.",
      };
    }

    // 📝 Update the note
    await prisma.updateSheet.update({
      where: { id: messageId },
      data: {
        commentFromSales: note.trim(),
      },
    });

    return {
      success: true,
      message: "Sales note has been added successfully.",
    };
  } catch (error) {
    console.error("AddSalesNote error:", error);
    return {
      success: false,
      message:
        "Something went wrong while adding the sales note. Please try again later.",
    };
  }
}
