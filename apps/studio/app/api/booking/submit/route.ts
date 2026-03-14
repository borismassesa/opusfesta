import { NextRequest, NextResponse } from 'next/server';
import { submitIntake } from '@/lib/booking-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { holdToken, name, email, phone, whatsapp, event_type, location, service, package_id, guest_count, message } = body;

    if (!holdToken) {
      return NextResponse.json({ error: 'holdToken is required' }, { status: 400 });
    }
    if (!name || !email || !event_type) {
      return NextResponse.json({ error: 'name, email, and event_type are required' }, { status: 400 });
    }

    const result = await submitIntake(holdToken, {
      name,
      email,
      phone,
      whatsapp,
      event_type,
      location,
      service,
      package_id,
      guest_count: guest_count ? Number(guest_count) : undefined,
      message,
    });

    return NextResponse.json({
      bookingId: result.booking.id,
      viewToken: result.viewToken,
      lifecycleStatus: result.booking.lifecycle_status,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Submission failed';
    const status = message.includes('expired') || message.includes('not found') ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
