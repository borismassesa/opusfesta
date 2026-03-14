import { Suspense } from 'react';
import type { Metadata } from 'next';
import PageLayout from '@/components/PageLayout';
import PortfolioGrid from '@/components/PortfolioGrid';

export const metadata: Metadata = {
  title: 'Portfolio | OpusFesta Studio',
  description: 'Browse our gallery of production photos and videos across commercial, documentary, music video, and branded work.',
};

export default function PortfolioPage() {
  return (
    <PageLayout>
      <Suspense>
        <PortfolioGrid />
      </Suspense>
    </PageLayout>
  );
}
