import { notFound } from 'next/navigation';
import { requireStudioRole } from '@/lib/admin-auth';
import { loadDocument } from '@/lib/cms/documents';
import { getContentType } from '@/lib/cms/types';
import DocumentEditor, { type DocumentRecord } from '@/components/admin/cms/DocumentEditor';

interface PageProps {
  params: Promise<{ type: string; id: string }>;
}

export default async function CmsEditPage({ params }: PageProps) {
  await requireStudioRole('studio_viewer');

  const { type, id } = await params;
  const contentType = getContentType(type);
  if (!contentType) notFound();
  const document = await loadDocument(type, id);
  if (!document) notFound();

  return <DocumentEditor type={type} mode="edit" document={document as DocumentRecord} />;
}
