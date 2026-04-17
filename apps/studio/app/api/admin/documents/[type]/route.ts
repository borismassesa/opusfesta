import { NextResponse } from 'next/server';
import { requireStudioRole } from '@/lib/admin-auth';
import {
  createDocument,
  jsonErrorResponse,
  listDocuments,
  recordRevision,
  resolveContentTypeOr404,
  validateContentOr400,
} from '@/lib/cms/documents';

type RouteContext = { params: Promise<{ type: string }> };

// ─── GET /api/admin/documents/[type] ─────────────────────────────────────────
// List all non-deleted documents of a given type. Ordering is driven by the
// content type's defaultSort / defaultSortDirection config.
export async function GET(_request: Request, { params }: RouteContext) {
  try {
    await requireStudioRole('studio_viewer');
    const { type } = await params;
    const ct = resolveContentTypeOr404(type);

    const sortColumn = ct.defaultSort === 'updated_at' ? 'updated_at' : 'created_at';
    const ascending = ct.defaultSortDirection === 'asc';
    const documents = await listDocuments(type, sortColumn, ascending);
    return NextResponse.json({ documents });
  } catch (e) {
    return jsonErrorResponse(e);
  }
}

// ─── POST /api/admin/documents/[type] ────────────────────────────────────────
// Create a new document. Validates the content against the type's Zod schema,
// then inserts it as a draft (published_content = null). Records a 'save'
// revision for the initial write.
export async function POST(request: Request, { params }: RouteContext) {
  try {
    const { userId } = await requireStudioRole('studio_editor');
    const { type } = await params;
    const ct = resolveContentTypeOr404(type);

    const body = await request.json().catch(() => null);
    const content = validateContentOr400(ct, body?.content);
    const document = await createDocument(type, content, userId);

    await recordRevision({
      documentId: document.id,
      content,
      action: 'save',
      createdBy: userId,
    });

    return NextResponse.json({ document }, { status: 201 });
  } catch (e) {
    return jsonErrorResponse(e);
  }
}
