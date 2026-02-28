'use client';

interface PortfolioFiltersProps {
  categories: string[];
  tags: string[];
  selectedCategory: string;
  selectedTag: string;
  sortBy: 'featured' | 'latest';
  onCategoryChange: (value: string) => void;
  onTagChange: (value: string) => void;
  onSortChange: (value: 'featured' | 'latest') => void;
}

export default function PortfolioFilters({
  categories,
  tags,
  selectedCategory,
  selectedTag,
  sortBy,
  onCategoryChange,
  onTagChange,
  onSortChange,
}: PortfolioFiltersProps) {
  return (
    <div className="mb-10 space-y-6 border-4 border-brand-border bg-brand-bg p-6">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-[10px] font-mono uppercase tracking-widest text-brand-muted">Category</span>
        <button
          type="button"
          onClick={() => onCategoryChange('all')}
          className={`border-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all ${
            selectedCategory === 'all'
              ? 'border-brand-dark bg-brand-dark text-white'
              : 'border-brand-border text-brand-dark hover:border-brand-accent hover:text-brand-accent'
          }`}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => onCategoryChange(category)}
            className={`border-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all ${
              selectedCategory === category
                ? 'border-brand-dark bg-brand-dark text-white'
                : 'border-brand-border text-brand-dark hover:border-brand-accent hover:text-brand-accent'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-[10px] font-mono uppercase tracking-widest text-brand-muted">Tag</span>
        <button
          type="button"
          onClick={() => onTagChange('all')}
          className={`border-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all ${
            selectedTag === 'all'
              ? 'border-brand-dark bg-brand-dark text-white'
              : 'border-brand-border text-brand-dark hover:border-brand-accent hover:text-brand-accent'
          }`}
        >
          All
        </button>
        {tags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => onTagChange(tag)}
            className={`border-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all ${
              selectedTag === tag
                ? 'border-brand-dark bg-brand-dark text-white'
                : 'border-brand-border text-brand-dark hover:border-brand-accent hover:text-brand-accent'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-[10px] font-mono uppercase tracking-widest text-brand-muted">Sort</span>
        <button
          type="button"
          onClick={() => onSortChange('featured')}
          className={`border-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all ${
            sortBy === 'featured'
              ? 'border-brand-dark bg-brand-dark text-white'
              : 'border-brand-border text-brand-dark hover:border-brand-accent hover:text-brand-accent'
          }`}
        >
          Featured First
        </button>
        <button
          type="button"
          onClick={() => onSortChange('latest')}
          className={`border-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all ${
            sortBy === 'latest'
              ? 'border-brand-dark bg-brand-dark text-white'
              : 'border-brand-border text-brand-dark hover:border-brand-accent hover:text-brand-accent'
          }`}
        >
          Latest
        </button>
      </div>
    </div>
  );
}
