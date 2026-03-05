import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withStudioRole } from "@/lib/studio-api";
import { createAdminAuditEvent, getDefaultStudioId } from "@/lib/studio-data";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const ExceptionSchema = z.object({
  id: z.string().uuid().optional(),
  date: z.string().min(1),
  isClosed: z.boolean(),
  overrideOpenTime: z.string().optional().nullable(),
  overrideCloseTime: z.string().optional().nullable(),
  reason: z.string().optional().nullable(),
});

const ExceptionPayloadSchema = z.object({
  rows: z.array(ExceptionSchema),
});

export async function GET(request: NextRequest) {
  return withStudioRole(request, "viewer", async () => {
    const studioId = await getDefaultStudioId();
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    let query = supabase
      .from("studio_hour_exceptions")
      .select("*")
      .eq("studio_id", studioId)
      .order("date", { ascending: true });
    if (from) query = query.gte("date", from);
    if (to) query = query.lte("date", to);

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: data ?? [] });
  });
}

export async function PUT(request: NextRequest) {
  return withStudioRole(request, "staff", async ({ actor }) => {
    const payload = await request.json();
    const parsed = ExceptionPayloadSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid exception payload" }, { status: 400 });
    }

    const studioId = await getDefaultStudioId();
    const supabase = getSupabaseAdmin();
    await supabase.from("studio_hour_exceptions").delete().eq("studio_id", studioId);

    const inserts = parsed.data.rows.map((row) => ({
      studio_id: studioId,
      date: row.date,
      is_closed: row.isClosed,
      override_open_time: row.overrideOpenTime ?? null,
      override_close_time: row.overrideCloseTime ?? null,
      reason: row.reason ?? null,
    }));

    if (inserts.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    const { data, error } = await supabase.from("studio_hour_exceptions").insert(inserts).select("*");
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    await createAdminAuditEvent({
      actorUserId: actor.userId,
      actorEmail: actor.email,
      module: "studio.availability",
      entityType: "studio_hour_exceptions",
      action: "availability.exception_updated",
      context: { count: inserts.length },
      ip: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    });

    return NextResponse.json({ success: true, data: data ?? [] });
  });
}
