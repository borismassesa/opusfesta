import { NextRequest, NextResponse } from 'next/server';
import { requireStudioRole } from '@/lib/admin-auth';
import { cancelBooking } from '@/lib/booking-service';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { clerkId } = await requireStudioRole('studio_editor');
    const { id } = await params;
    const body = await req.json();

    if (!body.reason) {
      return NextResponse.json({ error: 'reason is required' }, { status: 400 });
    }

    const result = await cancelBooking(id, body.reason, `admin:${clerkId}`);
    return NextResponse.json({ booking: result.booking, refund: result.refund });
  } catch (e) {
    if (e instanceof NextResponse) return e;
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
