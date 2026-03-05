import { NextRequest, NextResponse } from "next/server";
import { withStudioRole } from "@/lib/studio-api";
import { getDefaultStudioId } from "@/lib/studio-data";
import { computeAvailabilityPreview } from "@/lib/studio-availability";

export async function GET(request: NextRequest) {
  return withStudioRole(request, "viewer", async () => {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    if (!from || !to) {
      return NextResponse.json({ success: false, error: "from and to are required" }, { status: 400 });
    }
    const studioId = await getDefaultStudioId();
    const slots = await computeAvailabilityPreview({ studioId, from, to });
    return NextResponse.json({ success: true, data: slots });
  });
}
