// app/api/queues/delete-all/route.ts
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function DELETE() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404 },
      );
    }

    // Delete all queues where requestedBy is the logged-in user
    const deleted = await prisma.queue.deleteMany({
      where: { requestedById: session.user.id },
    });

    return NextResponse.json({
      success: true,
      message: `${deleted.count} queue(s) deleted successfully.`,
      data: { deletedCount: deleted.count },
    });
  } catch (error) {
    console.error("❌ DELETE /api/queues/delete error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while deleting queues.",
      },
      { status: 500 },
    );
  }
}
