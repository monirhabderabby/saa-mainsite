// app/api/updatesheets/route.ts
import { auth } from "@/auth";
import { getUpdateSheets } from "@/helper/update-sheet/update-sheet";
import { UpdateTo } from "@prisma/client";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const cu = await auth();

  if (!cu || !cu.user || !cu.user.id) {
    return Response.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const searchParams = req.nextUrl.searchParams;

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const rawUpdateTo = searchParams.get("updateTo") || undefined;
    const updateTo =
      rawUpdateTo && rawUpdateTo !== "All"
        ? (rawUpdateTo as UpdateTo)
        : undefined;
    const clientName = searchParams.get("clientName") || undefined;
    const orderId = searchParams.get("orderId") || undefined;
    const tl = searchParams.get("tl") || "All";
    const done = searchParams.get("done") || "All";

    const createdFrom = searchParams.get("createdFrom") || undefined;
    const createdTo = searchParams.get("createdTo") || undefined;
    const sendFrom = searchParams.get("sendFrom") || undefined;
    const sendTo = searchParams.get("sendTo") || undefined;

    // ✅ Read multiple values
    const rawProfileIds = searchParams.getAll("profileId");

    // handle both `?profileId=a,b` and `?profileId=a&profileId=b`
    const profileIds = rawProfileIds
      .flatMap((id) => id.split(",")) // split comma-separated values
      .map((id) => id.trim())
      .filter(Boolean); // remove empty strings

    // ✅ Normalize: if no specific IDs, treat as "All"
    const hasSpecificProfiles =
      profileIds.length > 0 && !profileIds.includes("All");

    const result = await getUpdateSheets({
      page,
      limit,
      profileIds: hasSpecificProfiles ? profileIds : undefined, // pass as array
      updateTo,
      clientName,
      orderId,
      tl: tl as "tlChecked" | "notTlCheck" | "All",
      done: done as "done" | "notDone" | "concern" | "All",
      createdFrom,
      createdTo,
      sendFrom,
      sendTo,
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
