// app/api/updatesheets/route.ts
import { getUpdateSheets } from "@/helper/update-sheet";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const profileId = searchParams.get("profileId") || undefined;
    const notTL = searchParams.get("notTL") === "true";
    const notDone = searchParams.get("notDone") === "true";

    const result = await getUpdateSheets({
      page,
      limit,
      profileId,
      notTL,
      notDone,
    });

    return Response.json({ success: true, ...result });
  } catch (error) {
    console.error(error);
    return Response.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
