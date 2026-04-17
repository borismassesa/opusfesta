import { NextResponse } from 'next/server';
import { requireStudioRole } from '@/lib/admin-auth';
import { jsonErrorResponse, listDocumentRevisions, resolveContentTypeOr404 } from '@/lib/cms/documents';

type RouteContext = { params: Promise<{ type: string; id: string }> };

// ─── GET /api/admin/documents/[type]/[id]/revisions ──────────────────────────
// Returns the append-only revision log for a document, newest first.
export async function GET(_request: Request, { params }: RouteContext) {
  try {
    await requireStudioRole('studio_viewer');
    const { type, id } = await params;
    resolveContentTypeOr404(type);
    const revisions = await listDocumentRevisions(type, id);
    if (revisions == null) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ revisions });
  } catch (e) {
    return jsonErrorResponse(e);
  }
}
