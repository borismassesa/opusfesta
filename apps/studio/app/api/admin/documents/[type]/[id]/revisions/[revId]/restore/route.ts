import { NextResponse } from 'next/server';
import { requireStudioRole } from '@/lib/admin-auth';
import {
  jsonErrorResponse,
  recordRevision,
  resolveContentTypeOr404,
  restoreDocumentRevision,
} from '@/lib/cms/documents';

type RouteContext = { params: Promise<{ type: string; id: string; revId: string }> };

// ─── POST /api/admin/documents/[type]/[id]/revisions/[revId]/restore ─────────
// Copies a historical revision's content into the document's draft_content.
// Does NOT automatically publish — the editor can save, review, and publish
// separately. Writes a new revision with action='restore' so history is linear.
export async function POST(_request: Request, { params }: RouteContext) {
  try {
    const { userId } = await requireStudioRole('studio_editor');
    const { type, id, revId } = await params;
    const ct = resolveContentTypeOr404(type);
    const document = await restoreDocumentRevision(type, id, revId, userId, ct);
    if (!document) {
      return NextResponse.json({ error: 'Revision not found' }, { status: 404 });
    }

    await recordRevision({
      documentId: id,
      content: document.draft_content,
      action: 'restore',
      createdBy: userId,
      comment: `Restored from revision ${revId}`,
    });

    return NextResponse.json({ document });
  } catch (e) {
    return jsonErrorResponse(e);
  }
}
