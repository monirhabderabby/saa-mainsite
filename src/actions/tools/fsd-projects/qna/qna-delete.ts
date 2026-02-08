"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export type QnaDeleteActionProps = {
  id: string;
};

export async function QnaDeleteAction({ id }: QnaDeleteActionProps) {
  const cu = await auth();

  if (!cu || !cu.user?.id) {
    return {
      success: false,
      message: "Unauthorized",
    };
  }

  try {
    // Optional ownership check
    const qna = await prisma.projectQna.findUnique({
      where: { id },
      select: { creatorId: true },
    });

    if (!qna || qna.creatorId !== cu.user.id) {
      return {
        success: false,
        message: "Not allowed to delete this Q&A",
      };
    }

    await prisma.projectQna.delete({
      where: { id },
    });

    return {
      success: true,
      message: "Q&A deleted successfully",
    };
  } catch (error) {
    console.log("QnaDeleteActionError", error);

    return {
      success: false,
      message: "Something went wrong",
    };
  }
}
