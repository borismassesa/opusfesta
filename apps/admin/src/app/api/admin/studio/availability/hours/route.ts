import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withStudioRole } from "@/lib/studio-api";
import { createAdminAuditEvent, getDefaultStudioId } from "@/lib/studio-data";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const HourRowSchema = z.object({
  id: z.string().uuid().optional(),
  weekday: z.number().int().min(0).max(6),
  isOpen: z.boolean(),
  openTime: z.string().optional().nullable(),
  closeTime: z.string().optional().nullable(),
  slotMinutes: z.number().int().min(15).max(240).default(60),
  bufferBeforeMinutes: z.number().int().min(0).max(180).default(0),
  bufferAfterMinutes: z.number().int().min(0).max(180).default(0),
  effectiveFrom: z.string().optional().nullable(),
  effectiveTo: z.string().optional().nullable(),
});

const HoursPayloadSchema = z.object({
  rows: z.array(HourRowSchema),
});

export async function GET(request: NextRequest) {
  return withStudioRole(request, "viewer", async () => {
    const studioId = await getDefaultStudioId();
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("studio_hours")
      .select("*")
      .eq("studio_id", studioId)
      .order("weekday", { ascending: true });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, data: data ?? [] });
  });
}

export async function PUT(request: NextRequest) {
  return withStudioRole(request, "staff", async ({ actor }) => {
    const payload = await request.json();
    const parsed = HoursPayloadSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid hours payload" }, { status: 400 });
    }

    const studioId = await getDefaultStudioId();
    const supabase = getSupabaseAdmin();

    // Delete existing hours first; bail out if delete fails to avoid orphaning data
    const { error: deleteError } = await supabase
      .from("studio_hours")
      .delete()
      .eq("studio_id", studioId);
    if (deleteError) {
      return NextResponse.json(
        { success: false, error: `Failed to clear existing hours: ${deleteError.message}` },
        { status: 500 },
      );
    }

    const inserts = parsed.data.rows.map((row) => ({
      studio_id: studioId,
      weekday: row.weekday,
      is_open: row.isOpen,
      open_time: row.openTime ?? null,
      close_time: row.closeTime ?? null,
      slot_minutes: row.slotMinutes,
      buffer_before_minutes: row.bufferBeforeMinutes,
      buffer_after_minutes: row.bufferAfterMinutes,
      effective_from: row.effectiveFrom ?? null,
      effective_to: row.effectiveTo ?? null,
    }));

    const { data, error } = await supabase.from("studio_hours").insert(inserts).select("*");

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    await createAdminAuditEvent({
      actorUserId: actor.userId,
      actorEmail: actor.email,
      module: "studio.availability",
      entityType: "studio_hours",
      action: "availability.hours_updated",
      context: {
        count: inserts.length,
      },
      ip: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    });

    return NextResponse.json({ success: true, data: data ?? [] });
  });
}
