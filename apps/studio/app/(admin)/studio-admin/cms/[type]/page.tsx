import { notFound } from 'next/navigation';
import { requireStudioRole } from '@/lib/admin-auth';
import { listDocuments } from '@/lib/cms/documents';
import { getContentType } from '@/lib/cms/types';
import DocumentList from '@/components/admin/cms/DocumentList';
import type { DocumentRecord } from '@/components/admin/cms/DocumentEditor';

interface PageProps {
  params: Promise<{ type: string }>;
}

export default async function CmsListPage({ params }: PageProps) {
  await requireStudioRole('studio_viewer');

  const { type } = await params;
  const contentType = getContentType(type);
  if (!contentType) notFound();

  const sortColumn = contentType.defaultSort === 'updated_at' ? 'updated_at' : 'created_at';
  const ascending = contentType.defaultSortDirection === 'asc';
  const documents = (await listDocuments(type, sortColumn, ascending)) as DocumentRecord[];

  return <DocumentList type={type} documents={documents} />;
}
