import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { projects, getProjectBySlug } from '@/lib/data';
import PageLayout from '@/components/PageLayout';
import CaseStudyContent from '@/components/CaseStudyContent';

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return { title: 'Not Found' };
  return {
    title: `${project.title} | OpusFesta Studio`,
    description: project.description,
  };
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  return (
    <PageLayout>
      <CaseStudyContent project={project} />
    </PageLayout>
  );
}
