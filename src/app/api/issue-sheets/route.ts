import { getIssueSheets } from "@/helper/issue-sheets/get-issue-sheets";
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

    console.log(`Get all issues take: ${durationMs}ms`);

    return Response.json({ success: true, ...result });
  } catch (error) {
    console.error(error);
    return Response.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
