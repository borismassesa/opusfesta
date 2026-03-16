'use client';

import { BsSearch } from 'react-icons/bs';

interface BookingFiltersProps {
  activeTab: 'all' | 'active' | 'past';
  onTabChange: (tab: 'all' | 'active' | 'past') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  counts: { all: number; active: number; past: number };
}

const TABS: { key: 'all' | 'active' | 'past'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'past', label: 'Past' },
];

export default function BookingFilters({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  counts,
}: BookingFiltersProps) {
  return (
    <div className="flex flex-col gap-2.5 sm:gap-3 sm:flex-row sm:items-center">
      {/* Status tabs — full width on mobile */}
      <div className="flex w-full sm:w-auto border-3 border-brand-border bg-white">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wider transition-colors ${
              activeTab === tab.key
                ? 'bg-brand-dark text-white'
                : 'text-brand-muted hover:text-brand-dark hover:bg-brand-bg'
            }`}
          >
            {tab.label} ({counts[tab.key]})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative flex-1 w-full sm:w-auto sm:max-w-xs">
        <BsSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-brand-muted" />
        <input
          type="text"
          placeholder="Search bookings..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full border-3 border-brand-border bg-white pl-8 pr-3 py-2 text-[11px] sm:text-xs font-mono text-brand-dark placeholder:text-brand-muted/60 focus:outline-none focus:border-brand-accent transition-colors"
        />
      </div>
    </div>
  );
}
