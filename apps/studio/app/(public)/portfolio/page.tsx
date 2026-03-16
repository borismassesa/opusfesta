import { Suspense } from 'react';
import type { Metadata } from 'next';
import PageLayout from '@/components/PageLayout';
import PortfolioGrid from '@/components/PortfolioGrid';
import { getPublishedProjects } from '@/lib/data-access';

export const metadata: Metadata = {
  title: 'Portfolio | OpusStudio',
  description: 'Browse our gallery of production photos and videos across commercial, documentary, music video, and branded work.',
};

export default async function PortfolioPage() {
  const projects = await getPublishedProjects();

  return (
    <PageLayout>
      <Suspense>
        <PortfolioGrid projects={projects} />
      </Suspense>
    </PageLayout>
  );
}
