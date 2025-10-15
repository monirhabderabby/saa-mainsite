// app/api/updatesheets/route.ts
import { auth } from "@/auth";
import { getUpdateSheets } from "@/helper/update-sheet/update-sheet";
import { redis } from "@/lib/redis/redis";
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

    const updateTo = searchParams.get("updateTo") || undefined;
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

    // ✅ Generate a cache key based on all parameters
    const cacheKey = `updateSheets:${JSON.stringify({
      page,
      limit,
      profileIds: hasSpecificProfiles ? profileIds : undefined,
      updateTo,
      clientName,
      orderId,
      tl,
      done,
      createdFrom,
      createdTo,
      sendFrom,
      sendTo,
    })}`;

    // Try fetching from Redis cache
    const cached = await redis.get(cacheKey);
    if (typeof cached === "string") {
      return Response.json({ success: true, ...JSON.parse(cached) });
    }

    const result = await getUpdateSheets({
      page,
      limit,
      profileIds: hasSpecificProfiles ? profileIds : undefined, // pass as array
      updateTo,
      clientName,
      orderId,
      tl: tl as "tlChecked" | "notTlCheck" | "All",
      done: done as "done" | "notDone" | "All",
      createdFrom,
      createdTo,
      sendFrom,
      sendTo,
    });

    await redis.set(cacheKey, JSON.stringify(result), { ex: 300 });

    return Response.json({ success: true, ...result });
  } catch (error) {
    console.error(error);
    return Response.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
