import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withStudioRole } from "@/lib/studio-api";
import { StudioBookingStatusSchema, createAdminAuditEvent, getDefaultStudioId } from "@/lib/studio-data";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const StatusUpdateSchema = z.object({
  status: StudioBookingStatusSchema,
  reason: z.string().optional(),
  rescheduledDate: z.string().optional(),
  rescheduledTime: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withStudioRole(request, "staff", async ({ actor }) => {
    const { id } = await params;
    const payload = await request.json();
    const parsed = StatusUpdateSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 });
    }

    const studioId = await getDefaultStudioId();
    const supabase = getSupabaseAdmin();
    const { data: existing } = await supabase
      .from("studio_bookings")
      .select("*")
      .eq("id", id)
      .eq("studio_id", studioId)
      .single();
    if (!existing) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }

    const updates: Record<string, unknown> = {
      status: parsed.data.status,
      assigned_staff_id: actor.userId,
    };
    if (parsed.data.rescheduledDate) updates.preferred_date = parsed.data.rescheduledDate;
    if (parsed.data.rescheduledTime) updates.preferred_start_time = parsed.data.rescheduledTime;

    const { data, error } = await supabase
      .from("studio_bookings")
      .update(updates)
      .eq("id", id)
      .eq("studio_id", studioId)
      .select("*")
      .single();

    if (error || !data) {
      return NextResponse.json({ success: false, error: error?.message ?? "Update failed" }, { status: 500 });
    }

    await supabase.from("studio_booking_activity").insert({
      booking_id: id,
      action_type: "booking.status_changed",
      action_details: {
        from: existing.status,
        to: parsed.data.status,
        reason: parsed.data.reason ?? null,
        rescheduledDate: parsed.data.rescheduledDate ?? null,
        rescheduledTime: parsed.data.rescheduledTime ?? null,
      },
      performed_by: actor.userId,
    });

    await createAdminAuditEvent({
      actorUserId: actor.userId,
      actorEmail: actor.email,
      module: "studio.bookings",
      entityType: "booking",
      entityId: id,
      action: "booking.status_changed",
      diff: {
        before: {
          status: existing.status,
          preferred_date: existing.preferred_date,
          preferred_start_time: existing.preferred_start_time,
        },
        after: {
          status: data.status,
          preferred_date: data.preferred_date,
          preferred_start_time: data.preferred_start_time,
        },
      },
      context: {
        reason: parsed.data.reason ?? null,
      },
      ip: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    });

    return NextResponse.json({ success: true, data });
  });
}
