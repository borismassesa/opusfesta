'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { PortfolioItem } from '@/lib/data';
import { getPortfolioCategories, getPortfolioTags } from '@/lib/portfolio';
import PortfolioEmptyState from '@/components/portfolio/PortfolioEmptyState';
import PortfolioFilters from '@/components/portfolio/PortfolioFilters';
import PortfolioGrid from '@/components/portfolio/PortfolioGrid';
import PortfolioMediaModal from '@/components/portfolio/PortfolioMediaModal';
import PortfolioSkeletonGrid from '@/components/portfolio/PortfolioSkeletonGrid';

interface PortfolioGalleryClientProps {
  items: PortfolioItem[];
  initialItemSlug?: string;
  initialCategory?: string;
  initialTag?: string;
  initialSort?: 'featured' | 'latest';
}

function toDateValue(value: string): number {
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

export default function PortfolioGalleryClient({
  items,
  initialItemSlug,
  initialCategory,
  initialTag,
  initialSort = 'featured',
}: PortfolioGalleryClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [activeItem, setActiveItem] = useState<PortfolioItem | null>(null);
  const [category, setCategory] = useState(initialCategory || 'all');
  const [tag, setTag] = useState(initialTag || 'all');
  const [sortBy, setSortBy] = useState<'featured' | 'latest'>(initialSort);
  const [hydrated, setHydrated] = useState(false);

  const categories = useMemo(() => getPortfolioCategories(items), [items]);
  const tags = useMemo(() => getPortfolioTags(items), [items]);

  const filteredItems = useMemo(() => {
    const filtered = items.filter((item) => {
      if (category !== 'all' && item.category !== category) return false;
      if (tag !== 'all' && !item.tags.includes(tag)) return false;
      return true;
    });

    if (sortBy === 'latest') {
      return [...filtered].sort((a, b) => toDateValue(b.date) - toDateValue(a.date));
    }

    return [...filtered].sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return toDateValue(b.date) - toDateValue(a.date);
    });
  }, [items, category, tag, sortBy]);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!initialItemSlug) return;
    const match = items.find((item) => item.slug === initialItemSlug);
    if (match) setActiveItem(match);
  }, [initialItemSlug, items]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (category !== 'all') params.set('category', category);
    if (tag !== 'all') params.set('tag', tag);
    if (sortBy !== 'featured') params.set('sort', sortBy);
    if (activeItem?.slug) params.set('item', activeItem.slug);

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [activeItem?.slug, category, tag, sortBy, pathname, router]);

  return (
    <>
      <PortfolioFilters
        categories={categories}
        tags={tags}
        selectedCategory={category}
        selectedTag={tag}
        sortBy={sortBy}
        onCategoryChange={setCategory}
        onTagChange={setTag}
        onSortChange={setSortBy}
      />

      {!hydrated ? (
        <PortfolioSkeletonGrid />
      ) : filteredItems.length === 0 ? (
        <PortfolioEmptyState />
      ) : (
        <PortfolioGrid items={filteredItems} onOpen={setActiveItem} />
      )}

      <PortfolioMediaModal item={activeItem} isOpen={Boolean(activeItem)} onClose={() => setActiveItem(null)} />
    </>
  );
}
