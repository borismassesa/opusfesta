import { NextRequest, NextResponse } from "next/server";
import { StudioRole, requireStudioRole } from "@/lib/studio-auth";

export async function withStudioRole(
  request: NextRequest,
  minRole: StudioRole,
  handler: (context: {
    actor: Awaited<ReturnType<typeof requireStudioRole>>;
    request: NextRequest;
  }) => Promise<NextResponse>
) {
  try {
    const actor = await requireStudioRole(minRole);
    return await handler({ actor, request });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
