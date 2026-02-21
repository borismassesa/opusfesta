import type { Metadata } from 'next';
import PageLayout from '@/components/PageLayout';
import PortfolioGrid from '@/components/PortfolioGrid';

export const metadata: Metadata = {
  title: 'Portfolio | OpusFesta Studio',
  description: 'Explore our signature work — cinematic weddings, event coverage, corporate films, and commercial productions.',
};

export default function PortfolioPage() {
  return (
    <PageLayout>
      <PortfolioGrid />
    </PageLayout>
  );
}
