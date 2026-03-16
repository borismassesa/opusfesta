import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireStudioRole } from '@/lib/admin-auth';

export async function POST(req: NextRequest) {
  try {
    await requireStudioRole('studio_admin');
    const body = await req.json().catch(() => ({}));
    const { path } = body as { path?: string };

    if (path) {
      revalidatePath(path);
    }

    // Always revalidate the full site layout to bust all unstable_cache entries
    revalidatePath('/', 'layout');

    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (e) {
    if (e instanceof NextResponse) return e;
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
