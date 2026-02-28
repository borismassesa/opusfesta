import type { PortfolioItem } from '@/lib/data';
import PortfolioGalleryClient from '@/components/portfolio/PortfolioGalleryClient';

interface PortfolioGridProps {
  items: PortfolioItem[];
  initialItemSlug?: string;
  initialCategory?: string;
  initialTag?: string;
  initialSort?: 'featured' | 'latest';
}

export default function PortfolioGrid({
  items,
  initialItemSlug,
  initialCategory,
  initialTag,
  initialSort,
}: PortfolioGridProps) {
  return (
    <section className="bg-brand-bg py-24">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <div className="mb-16">
          <span className="mb-6 block text-xs font-bold uppercase tracking-widest text-brand-accent font-mono">
            Portfolio
          </span>
          <h1 className="text-5xl font-bold leading-[0.9] tracking-tighter text-brand-dark md:text-7xl lg:text-8xl">
            OUR
            <br />
            <span className="stroke-text stroke-text-default stroke-fill-none stroke-interactive">WORK.</span>
          </h1>
        </div>

        <PortfolioGalleryClient
          items={items}
          initialItemSlug={initialItemSlug}
          initialCategory={initialCategory}
          initialTag={initialTag}
          initialSort={initialSort}
        />
      </div>
    </section>
  );
}
