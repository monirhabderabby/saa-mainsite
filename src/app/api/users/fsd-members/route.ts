import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const fsdServiceLineId = "68db8138761047ed1e7edcd9";
const uiuxDesignations = [
  "Sr. UX/UI Designer",
  "UX/UI Designer",
  "Jr. UX/UI Designer",
];

const backendDesignations = [
  "Jr. Back-End Developer",
  "Back-End Developer",
  "Sr. Back-End Developer",
];

const frontendDesignations = [
  "Jr. Front-End Developer",
  "Front-End Developer",
  "Sr. Front-End Developer",
];

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const membersOf = searchParams.get("membersOf") ?? undefined;

  if (membersOf === "uiux") {
    const users = await prisma.user.findMany({
      where: {
        serviceId: fsdServiceLineId,
        designation: {
          name: {
            in: uiuxDesignations,
          },
        },
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
  } else if (membersOf === "backend") {
    const users = await prisma.user.findMany({
      where: {
        serviceId: fsdServiceLineId,
        designation: {
          name: {
            in: backendDesignations,
          },
        },
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
  } else if (membersOf === "frontend") {
    const users = await prisma.user.findMany({
      where: {
        serviceId: fsdServiceLineId,
        designation: {
          name: {
            in: frontendDesignations,
          },
        },
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
}
