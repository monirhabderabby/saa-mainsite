import { getIssueSheets } from "@/helper/issue-sheets/get-issue-sheets";
import { redis } from "@/lib/redis/redis";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const profileId = searchParams.get("profileId") || undefined;
    const serviceId = searchParams.get("serviceId") || undefined;
    const teamId = searchParams.get("teamId") || undefined;
    const clientName = searchParams.get("clientName") || undefined;
    const orderId = searchParams.get("orderId") || undefined;
    const status = searchParams.get("status") || undefined;
    const createdFrom = searchParams.get("createdFrom") || undefined;
    const createdTo = searchParams.get("createdTo") || undefined;

    // Build a unique cache key based on params
    const cacheKey = `issueSheets:${JSON.stringify({
      page,
      limit,
      profileId,
      serviceId,
      teamId,
      clientName,
      orderId,
      status,
      createdFrom,
      createdTo,
    })}`;

    const cacheStart = performance.now();

    // Try to get from cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log("Cache hit ✅", cacheKey);
      const end = performance.now();
      const durationMs = end - cacheStart;

      console.log(`Cache HIT: ${durationMs.toFixed(2)}ms`);
      return Response.json({ success: true, ...cached });
    }

    console.log("Cache miss ❌", cacheKey);

    // Start timer
    const start = performance.now();

    const result = await getIssueSheets({
      page,
      limit,
      profileId,
      serviceId,
      teamId,
      clientName,
      orderId,
      status,
      createdFrom,
      createdTo,
    });

    // End timer
    const end = performance.now();
    const durationMs = end - start;

    console.log(`Get all issues take: ${durationMs.toFixed(2)}ms`);

    // Save result to Redis with TTL (e.g., 60 seconds)
    await redis.set(cacheKey, result, { ex: 300 });

    return Response.json({ success: true, ...result });
  } catch (error) {
    console.error(error);
    return Response.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
