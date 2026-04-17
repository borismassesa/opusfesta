import { NextResponse } from 'next/server';
import { requireStudioRole } from '@/lib/admin-auth';
import {
  jsonErrorResponse,
  publishDocument,
  recordRevision,
  resolveContentTypeOr404,
  unpublishDocument,
} from '@/lib/cms/documents';

type RouteContext = { params: Promise<{ type: string; id: string }> };

// ─── POST /api/admin/documents/[type]/[id]/publish ───────────────────────────
// Snapshot draft_content → published_content and set published_at = now.
// The draft is left unchanged, so a subsequent edit starts a new draft cycle.
export async function POST(_request: Request, { params }: RouteContext) {
  try {
    const { userId } = await requireStudioRole('studio_editor');
    const { type, id } = await params;
    resolveContentTypeOr404(type);
    const document = await publishDocument(type, id, userId);
    if (!document) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await recordRevision({
      documentId: id,
      content: document.draft_content,
      action: 'publish',
      createdBy: userId,
    });

    return NextResponse.json({ document });
  } catch (e) {
    return jsonErrorResponse(e);
  }
}

// ─── DELETE /api/admin/documents/[type]/[id]/publish ─────────────────────────
// Unpublish: clear published_content and published_at. Draft is preserved.
export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const { userId } = await requireStudioRole('studio_editor');
    const { type, id } = await params;
    resolveContentTypeOr404(type);
    const document = await unpublishDocument(type, id, userId);
    if (!document) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await recordRevision({
      documentId: id,
      content: (document.published_content ?? document.draft_content) as Record<string, unknown>,
      action: 'unpublish',
      createdBy: userId,
    });

    return NextResponse.json({ document });
  } catch (e) {
    return jsonErrorResponse(e);
  }
}
