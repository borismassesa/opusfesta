import { notFound } from 'next/navigation';
import { requireStudioRole } from '@/lib/admin-auth';
import { getContentType } from '@/lib/cms/types';
import DocumentEditor from '@/components/admin/cms/DocumentEditor';

interface PageProps {
  params: Promise<{ type: string }>;
}

export default async function CmsNewPage({ params }: PageProps) {
  await requireStudioRole('studio_editor');

  const { type } = await params;
  const contentType = getContentType(type);
  if (!contentType) notFound();

  return <DocumentEditor type={type} mode="create" />;
}
