import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { projects } from '@/lib/data';

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Portfolio | OpusFesta Studio',
    description: 'Browse our portfolio gallery.',
  };
}

export default async function CaseStudyPage() {
  redirect('/portfolio');
}
