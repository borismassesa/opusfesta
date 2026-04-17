import { NextResponse } from 'next/server';
import { requireStudioRole } from '@/lib/admin-auth';
import {
  deleteDocument,
  jsonErrorResponse,
  loadDocument,
  recordRevision,
  resolveContentTypeOr404,
  updateDocument,
  validateContentOr400,
} from '@/lib/cms/documents';

type RouteContext = { params: Promise<{ type: string; id: string }> };

// ─── GET /api/admin/documents/[type]/[id] ────────────────────────────────────
export async function GET(_request: Request, { params }: RouteContext) {
  try {
    await requireStudioRole('studio_viewer');
    const { type, id } = await params;
    resolveContentTypeOr404(type);
    const document = await loadDocument(type, id);
    if (!document) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ document });
  } catch (e) {
    return jsonErrorResponse(e);
  }
}

// ─── PATCH /api/admin/documents/[type]/[id] ──────────────────────────────────
// Save the draft. Does NOT touch published_content or published_at.
// The editor calls this on "Save draft" and (implicitly) before publish.
export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const { userId } = await requireStudioRole('studio_editor');
    const { type, id } = await params;
    const ct = resolveContentTypeOr404(type);

    const body = await request.json().catch(() => null);
    const content = validateContentOr400(ct, body?.content);
    const document = await updateDocument(type, id, content, userId);
    if (!document) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await recordRevision({
      documentId: id,
      content,
      action: 'save',
      createdBy: userId,
    });

    return NextResponse.json({ document });
  } catch (e) {
    return jsonErrorResponse(e);
  }
}

// ─── DELETE /api/admin/documents/[type]/[id] ─────────────────────────────────
// Soft delete — sets deleted_at. Row is preserved for audit/restore.
export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const { userId } = await requireStudioRole('studio_editor');
    const { type, id } = await params;
    resolveContentTypeOr404(type);
    const deleted = await deleteDocument(type, id, userId);
    if (!deleted) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    return jsonErrorResponse(e);
  }
}
