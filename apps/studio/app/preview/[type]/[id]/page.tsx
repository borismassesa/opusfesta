import { notFound } from 'next/navigation';
import { draftMode } from 'next/headers';
import { loadDocument } from '@/lib/cms/documents';
import { getContentType } from '@/lib/cms/types';
import ArticleRenderer from '@/components/cms/render/ArticleRenderer';
import ProjectRenderer from '@/components/cms/render/ProjectRenderer';
import TestimonialRenderer from '@/components/cms/render/TestimonialRenderer';
import TeamMemberRenderer from '@/components/cms/render/TeamMemberRenderer';
import ServiceRenderer from '@/components/cms/render/ServiceRenderer';
import JsonRenderer from '@/components/cms/render/JsonRenderer';

interface PreviewPageProps {
  params: Promise<{ type: string; id: string }>;
}

// Preview route — renders a studio_documents row using the draft or
// published content depending on Next.js Draft Mode cookie.
//
// - Draft mode ON  → draft_content  (admin-only; cookie set by /api/admin/preview/enable)
// - Draft mode OFF → published_content (publicly visible once the doc is published)
//
// The route is intentionally NOT gated by the admin middleware: published
// content should be accessible to non-admins via a stable URL, and draft
// mode itself gates unpublished content.
export default async function PreviewPage({ params }: PreviewPageProps) {
  const { type, id } = await params;

  const contentType = getContentType(type);
  if (!contentType) notFound();

  const dm = await draftMode();
  const isDraft = dm.isEnabled;
  const document = await loadDocument(type, id);
  if (!document) notFound();

  const content = isDraft ? document.draft_content : document.published_content;
  if (!content) notFound();

  const typed = content as Record<string, unknown>;

  switch (type) {
    case 'article':
      return <ArticleRenderer content={typed as unknown as Parameters<typeof ArticleRenderer>[0]['content']} isDraft={isDraft} />;
    case 'project':
      return <ProjectRenderer content={typed as unknown as Parameters<typeof ProjectRenderer>[0]['content']} isDraft={isDraft} />;
    case 'testimonial':
      return <TestimonialRenderer content={typed as unknown as Parameters<typeof TestimonialRenderer>[0]['content']} isDraft={isDraft} />;
    case 'teamMember':
      return <TeamMemberRenderer content={typed as unknown as Parameters<typeof TeamMemberRenderer>[0]['content']} isDraft={isDraft} />;
    case 'service':
      return <ServiceRenderer content={typed as unknown as Parameters<typeof ServiceRenderer>[0]['content']} isDraft={isDraft} />;
    default:
      return <JsonRenderer type={type} content={typed} isDraft={isDraft} />;
  }
}
