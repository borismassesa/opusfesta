import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireStudioRole } from '@/lib/admin-auth';
import { adminOverrideTransition } from '@/lib/booking-service';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId: clerkId } = await requireStudioRole('studio_admin');
    const { id } = await params;
    const body = await req.json();

    if (!body.toStatus || !body.reason) {
      return NextResponse.json({ error: 'toStatus and reason are required' }, { status: 400 });
    }

    const booking = await adminOverrideTransition(id, body.toStatus, body.reason, clerkId);
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
