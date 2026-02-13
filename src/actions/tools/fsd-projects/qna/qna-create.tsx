"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export type QnaCreateActionProps = {
  question: string;
  answer: string;
  projectId: string;
};

export async function QnaCreateAction(data: QnaCreateActionProps) {
  const cu = await auth();

  if (!cu || !cu.user || !cu.user.id) {
    return {
      success: false,
      message: "Unauthorized",
    };
  }

  const { question, answer, projectId } = data;

  try {
    const qna = await prisma.projectQna.create({
      data: {
        question,
        answer,
        projectId,
        creatorId: cu.user.id,
      },
    });

    return {
      success: true,
      message: "Q&A created successfully",
      data: qna,
    };
  } catch (error) {
    console.log("QnaCreateActionError", error);

    return {
      success: false,
      message: "Something went wrong",
    };
  }
}
