// app/api/users/route.ts
import { getUsers } from "@/helper/users";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // const cu = await auth();

  // if (!cu || !cu.user || !cu.user.id) {
  //   return Response.json(
  //     { success: false, message: "Unauthorized" },
  //     { status: 401 }
  //   );
  // }

  try {
    const searchParams = req.nextUrl.searchParams;

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const serviceId = searchParams.get("serviceid") ?? undefined;
    const teamId = searchParams.get("teamId") ?? undefined;

    // Optional filters (you can extend this as needed)
    const name = searchParams.get("name") || undefined;

    const { data, pagination } = await getUsers({
      limit,
      page,
      name,
      serviceId,
      teamId,
    });

    return Response.json({
      success: true,
      data,
      pagination,
    });
  } catch (error) {
    console.error(error);
    return Response.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
