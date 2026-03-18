import { NextRequest, NextResponse } from "next/server";
import { withStudioRole } from "@/lib/studio-api";
import { getDefaultStudioId } from "@/lib/studio-data";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withStudioRole(request, "viewer", async () => {
    const { id } = await params;
    const studioId = await getDefaultStudioId();
    const supabase = getSupabaseAdmin();

    const [{ data: booking, error }, { data: notes }, { data: activity }] = await Promise.all([
      supabase
        .from("studio_bookings")
        .select("*, studio_services(id,title,slug)")
        .eq("id", id)
        .eq("studio_id", studioId)
        .single(),
      supabase
        .from("studio_booking_notes")
        .select("*, users(id,name,email)")
        .eq("booking_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("studio_booking_activity")
        .select("*, users(id,name,email)")
        .eq("booking_id", id)
        .order("performed_at", { ascending: false }),
    ]);

    if (error || !booking) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...booking,
        notes: notes ?? [],
        activity: activity ?? [],
      },
    });
  });
}
