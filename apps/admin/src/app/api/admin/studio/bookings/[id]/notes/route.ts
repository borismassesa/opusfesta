import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withStudioRole } from "@/lib/studio-api";
import { createAdminAuditEvent } from "@/lib/studio-data";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const NoteSchema = z.object({
  body: z.string().min(1).max(5000),
  visibility: z.literal("internal").default("internal"),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withStudioRole(request, "staff", async ({ actor }) => {
    const { id } = await params;
    const payload = await request.json();
    const parsed = NoteSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid note payload" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("studio_booking_notes")
      .insert({
        booking_id: id,
        body: parsed.data.body,
        created_by: actor.userId,
      })
      .select("*")
      .single();

    if (error || !data) {
      return NextResponse.json({ success: false, error: error?.message ?? "Failed to save note" }, { status: 500 });
    }

    await supabase.from("studio_booking_activity").insert({
      booking_id: id,
      action_type: "booking.note_added",
      action_details: {
        note_id: data.id,
        visibility: parsed.data.visibility,
      },
      performed_by: actor.userId,
    });

    await createAdminAuditEvent({
      actorUserId: actor.userId,
      actorEmail: actor.email,
      module: "studio.bookings",
      entityType: "booking_note",
      entityId: data.id,
      action: "booking.note_added",
      context: {
        bookingId: id,
      },
      ip: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    });

    return NextResponse.json({ success: true, data }, { status: 201 });
  });
}
