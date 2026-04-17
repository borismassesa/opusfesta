import { NextResponse } from 'next/server';
import { draftMode } from 'next/headers';
import { requireStudioRole } from '@/lib/admin-auth';

// ─── POST /api/admin/preview/disable ────────────────────────────────────────
// Clears the Next.js Draft Mode cookie. Public routes revert to rendering
// published_content.
export async function POST() {
  try {
    await requireStudioRole('studio_viewer');
    const dm = await draftMode();
    dm.disable();
    return NextResponse.json({ enabled: false });
  } catch (e) {
    if (e instanceof NextResponse) return e;
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
