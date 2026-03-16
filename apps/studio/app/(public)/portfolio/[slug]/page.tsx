import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getProjectBySlug } from '@/lib/data-access';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: 'Portfolio | OpusStudio' };

  return {
    title: project.seo_title || `${project.title} | OpusStudio Portfolio`,
    description: project.seo_description || project.description,
  };
}

export default async function CaseStudyPage() {
  redirect('/portfolio');
}
