import type { Metadata } from 'next';
import PageLayout from '@/components/PageLayout';
import PortfolioGrid from '@/components/PortfolioGrid';
import { getPortfolioItems } from '@/lib/portfolio';

export const metadata: Metadata = {
  title: 'Portfolio | OpusFesta Studio',
  description: 'Explore our signature work — cinematic weddings, event coverage, corporate films, and commercial productions.',
};

interface PortfolioPageProps {
  searchParams: Promise<{
    item?: string;
    category?: string;
    tag?: string;
    sort?: 'featured' | 'latest';
  }>;
}

export default async function PortfolioPage({ searchParams }: PortfolioPageProps) {
  const { item, category, tag, sort } = await searchParams;
  const items = getPortfolioItems();

  return (
    <PageLayout>
      <PortfolioGrid
        items={items}
        initialItemSlug={item}
        initialCategory={category}
        initialTag={tag}
        initialSort={sort}
      />
    </PageLayout>
  );
}
