import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireStudioRole } from '@/lib/admin-auth';
import { qualifyBooking } from '@/lib/booking-service';

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId: clerkId } = await requireStudioRole('studio_editor');
    const { id } = await params;
    const booking = await qualifyBooking(id, clerkId);
    revalidatePath('/', 'layout');
    return NextResponse.json({ booking });
  } catch (e) {
    if (e instanceof NextResponse) return e;
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
