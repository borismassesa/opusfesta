import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: vendorId } = await params;
    const { searchParams } = new URL(request.url);
    
    // Get optional date range from query params
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    
    // Default to next 12 months if no dates provided
    const today = new Date();
    const defaultStartDate = today.toISOString().split("T")[0];
    const defaultEndDate = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate())
      .toISOString()
      .split("T")[0];
    
    const queryStartDate = startDate || defaultStartDate;
    const queryEndDate = endDate || defaultEndDate;

    // Validate vendor exists
    const { data: vendor, error: vendorError } = await supabase
      .from("vendors")
      .select("id")
      .eq("id", vendorId)
      .single();

    if (vendorError || !vendor) {
      return NextResponse.json(
        { error: "Vendor not found" },
        { status: 404 }
      );
    }

    // Get availability using the function
    const { data: availability, error: availabilityError } = await supabase
      .rpc("get_vendor_availability", {
        vendor_uuid: vendorId,
        start_date: queryStartDate,
        end_date: queryEndDate,
      });

    if (availabilityError) {
      console.error("Error fetching availability:", availabilityError);
      return NextResponse.json(
        { error: "Failed to fetch availability", details: availabilityError.message },
        { status: 500 }
      );
    }

    // Get booked dates from inquiries
    const { data: bookedDates, error: bookedError } = await supabase
      .rpc("get_vendor_booked_dates", {
        vendor_uuid: vendorId,
        start_date: queryStartDate,
        end_date: queryEndDate,
      });

    if (bookedError) {
      console.error("Error fetching booked dates:", bookedError);
      // Continue without booked dates if there's an error
    }

    // Transform the data
    const availableDates: string[] = [];
    const unavailableDates: string[] = [];
    const bookedDatesList: string[] = (bookedDates || []).map((d: { date: string }) => d.date);

    (availability || []).forEach((item: { date: string; is_available: boolean; reason: string | null }) => {
      const dateStr = item.date;
      // If it's explicitly marked as unavailable or in booked dates, mark as unavailable
      if (!item.is_available || bookedDatesList.includes(dateStr)) {
        unavailableDates.push(dateStr);
      } else {
        availableDates.push(dateStr);
      }
    });

    return NextResponse.json({
      vendorId,
      startDate: queryStartDate,
      endDate: queryEndDate,
      availableDates,
      unavailableDates,
      bookedDates: bookedDatesList,
    });
  } catch (error) {
    console.error("Unexpected error fetching availability:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
