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

  const profiles = await prisma.profile.findMany();

  return NextResponse.json(profiles ?? [], {
    status: 200,
  });
}
