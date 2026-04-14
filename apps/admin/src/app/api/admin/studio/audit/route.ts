import { NextRequest, NextResponse } from "next/server";
import { withStudioRole } from "@/lib/studio-api";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(request: NextRequest) {
  return withStudioRole(request, "admin", async () => {
    const { searchParams } = new URL(request.url);
    const module = searchParams.get("module");
    const entityType = searchParams.get("entityType");
    const actorUserId = searchParams.get("actorUserId");
    const page = Number(searchParams.get("page") ?? "1");
    const pageSize = Math.min(100, Number(searchParams.get("pageSize") ?? "50"));
    const offset = (Math.max(1, page) - 1) * pageSize;

    const supabase = getSupabaseAdmin();
    let query = supabase.from("admin_audit_log").select("*", { count: "exact" });
    if (module) query = query.eq("module", module);
    if (entityType) query = query.eq("entity_type", entityType);
    if (actorUserId) query = query.eq("actor_user_id", actorUserId);

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({
      success: true,
      data: data ?? [],
      pagination: {
        page,
        pageSize,
        total: count ?? 0,
        totalPages: Math.max(1, Math.ceil((count ?? 0) / pageSize)),
      },
    });
  });
}
