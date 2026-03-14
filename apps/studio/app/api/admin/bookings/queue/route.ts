import { NextResponse } from 'next/server';
import { requireStudioRole } from '@/lib/admin-auth';
import { getAdminQueue } from '@/lib/booking-service';

export async function GET() {
  try {
    await requireStudioRole('studio_viewer');
    const queue = await getAdminQueue();
    return NextResponse.json(queue);
  } catch (e) {
    if (e instanceof NextResponse) return e;
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
