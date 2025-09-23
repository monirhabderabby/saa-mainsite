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
    const serviceId = searchParams.get("serviceId") ?? undefined;
    const teamId = searchParams.get("teamId") ?? undefined;

    // Optional filters (you can extend this as needed)
    const searchQuery = searchParams.get("searchQuery") || undefined;

    const res = await getUsers({
      limit,
      page,
      searchQuery,
      serviceId,
      teamId,
    });

    return Response.json(res);
  } catch (error) {
    console.error(error);
    return Response.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
