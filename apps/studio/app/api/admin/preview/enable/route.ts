import { NextResponse } from 'next/server';
import { draftMode } from 'next/headers';
import { requireStudioRole } from '@/lib/admin-auth';

// ─── POST /api/admin/preview/enable ─────────────────────────────────────────
// Activates Next.js Draft Mode. Sets an httpOnly cookie that public routes
// can read via `draftMode().isEnabled` to render draft_content instead of
// published_content.
//
// Admin-only — gated by middleware (/api/admin/*) plus explicit role check.
export async function POST() {
  try {
    await requireStudioRole('studio_editor');
    const dm = await draftMode();
    dm.enable();
    return NextResponse.json({ enabled: true });
  } catch (e) {
    if (e instanceof NextResponse) return e;
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
