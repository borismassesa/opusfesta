import type { PortfolioItem } from '@/lib/data';
import PortfolioCard from '@/components/portfolio/PortfolioCard';

interface PortfolioGridProps {
  items: PortfolioItem[];
  onOpen: (item: PortfolioItem) => void;
}

export default function PortfolioGrid({ items, onOpen }: PortfolioGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <PortfolioCard key={item.id} item={item} onOpen={onOpen} />
      ))}
    </div>
  );
}
