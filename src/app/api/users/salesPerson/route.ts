import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  //   const cu = await auth();

  //   if (!cu?.user?.id) {
  //     return NextResponse.json(
  //       { success: false, message: "Unauthorized" },
  //       { status: 401 },
  //     );
  //   }

  const users = await prisma.user.findMany({
    where: {
      role: "SALES_MEMBER",
    },
    select: {
      fullName: true,
      id: true,
      image: true,
      employeeId: true,
    },
  });

  return NextResponse.json(users ?? [], {
    status: 200,
  });
}
