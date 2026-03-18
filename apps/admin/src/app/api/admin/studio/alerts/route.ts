import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withStudioRole } from "@/lib/studio-api";
import { createAdminAuditEvent, getDefaultStudioId } from "@/lib/studio-data";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const AlertPatchSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["acknowledged", "resolved"]),
});

export async function GET(request: NextRequest) {
  return withStudioRole(request, "viewer", async () => {
    const studioId = await getDefaultStudioId();
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("system_alerts")
      .select("*")
      .eq("studio_id", studioId)
      .order("last_seen_at", { ascending: false })
      .limit(100);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, data: data ?? [] });
  });
}

export async function PATCH(request: NextRequest) {
  return withStudioRole(request, "staff", async ({ actor }) => {
    const payload = await request.json();
    const parsed = AlertPatchSchema.safeParse(payload);
    if (!parsed.success) return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 });
    const studioId = await getDefaultStudioId();
    const supabase = getSupabaseAdmin();
    const updates: Record<string, unknown> = { status: parsed.data.status };
    if (parsed.data.status === "resolved") updates.resolved_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("system_alerts")
      .update(updates)
      .eq("id", parsed.data.id)
      .eq("studio_id", studioId)
      .select("*")
      .single();
    if (error || !data) return NextResponse.json({ success: false, error: error?.message ?? "Failed" }, { status: 500 });

    await createAdminAuditEvent({
      actorUserId: actor.userId,
      actorEmail: actor.email,
      module: "studio.alerts",
      entityType: "system_alert",
      entityId: data.id,
      action: `system.alert_${parsed.data.status}`,
    });

    return NextResponse.json({ success: true, data });
  });
}
