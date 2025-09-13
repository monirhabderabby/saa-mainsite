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
    const updateTo = searchParams.get("updateTo") || undefined;

    const tl = searchParams.get("tl") || "All"; // tlChecked | notTlCheck | All
    const done = searchParams.get("done") || "All"; // done | notDone | All

    const result = await getUpdateSheets({
      page,
      limit,
      profileId,
      updateTo,
      tl: tl as "tlChecked" | "notTlCheck" | "All",
      done: done as "done" | "notDone" | "All",
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
