import { NextRequest, NextResponse } from 'next/server';
import { createSlotHold, releaseSlotHold } from '@/lib/booking-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { date, timeSlot, email, sessionId } = body;

    if (!date || !timeSlot) {
      return NextResponse.json({ error: 'date and timeSlot are required' }, { status: 400 });
    }

    // Validate date is in the future
    if (new Date(date) < new Date(new Date().toISOString().split('T')[0])) {
      return NextResponse.json({ error: 'Cannot hold a slot in the past' }, { status: 400 });
    }

    const result = await createSlotHold(date, timeSlot, email, sessionId);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create hold';
    const status = message.includes('already') || message.includes('held') ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { holdToken } = body;

    if (!holdToken) {
      return NextResponse.json({ error: 'holdToken is required' }, { status: 400 });
    }

    await releaseSlotHold(holdToken);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to release hold' },
      { status: 500 }
    );
  }
}
