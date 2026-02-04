"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export type QnaUpdateActionProps = {
  id: string;
  question: string;
  answer: string;
};

export async function QnaUpdateAction(data: QnaUpdateActionProps) {
  const cu = await auth();

  if (!cu || !cu.user || !cu.user.id) {
    return {
      success: false,
      message: "Unauthorized",
    };
  }

  const { id, question, answer } = data;

  try {
    // Optional: ensure the user owns this Q&A
    const existingQna = await prisma.projectQna.findUnique({
      where: { id },
      select: { creatorId: true },
    });

    if (!existingQna) {
      return {
        success: false,
        message: "Q&A not found",
      };
    }

    const qna = await prisma.projectQna.update({
      where: { id },
      data: {
        question,
        answer,
      },
    });

    return {
      success: true,
      message: "Q&A updated successfully",
      data: qna,
    };
  } catch (error) {
    console.log("QnaUpdateActionError", error);

    return {
      success: false,
      message: "Something went wrong",
    };
  }
}
