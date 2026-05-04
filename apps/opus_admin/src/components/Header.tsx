'use client'

import { Bell, HelpCircle, Search, X } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { usePageHeading } from "./PageHeading";
import { usePageSearch } from "./PageSearch";

// Two empty placeholders sit in the header for pages that need to inject
// their own page-specific content. The vendor review page, for example,
// portals its status pill into `#page-header-badge` and its action buttons
// (Approve / Request corrections / Suspend) into `#page-header-actions`.
// IDs are stable so portals attach reliably across HMR cycles.
const BADGE_SLOT_ID = 'page-header-badge'
const ACTIONS_SLOT_ID = 'page-header-actions'

export function Header() {
  // Heading and search are both driven by each page via context — the page
  // is the only thing that knows what it's actually showing and what a
  // search query should match against.
  const heading = usePageHeading()
  const search = usePageSearch()

  return (
    <header className="flex items-center justify-between gap-6 pt-4 pb-3 px-8 bg-gray-50/50 relative z-10 w-full shrink-0">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          {heading?.title && (
            <h1 className="text-xl font-semibold text-gray-900 tracking-tight truncate">
              {heading.title}
            </h1>
          )}
          {/* Page-specific badge slot (e.g. vendor onboarding status pill). */}
          <div id={BADGE_SLOT_ID} className="contents" />
        </div>
        {heading?.subtitle && (
          <p className="mt-0.5 text-sm text-gray-500 truncate">
            {heading.subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {/* Page-specific action buttons slot — sits before the global icons
            so the page's primary CTA stays the leftmost interactive element
            in the right rail. */}
        <div id={ACTIONS_SLOT_ID} className="flex items-center gap-2" />

        {search && (
          <div className="relative w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={search.value}
              onChange={(e) => search.onChange(e.target.value)}
              placeholder={search.placeholder}
              aria-label={search.ariaLabel}
              className="w-full h-9 pl-9 pr-9 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5B2D8E]/30 focus:border-[#5B2D8E]/40 transition-all"
            />
            {search.value && (
              <button
                type="button"
                onClick={() => (search.onClear ? search.onClear() : search.onChange(''))}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded text-gray-400 hover:text-gray-700 inline-flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        <button className="text-gray-400 hover:text-gray-600 transition-colors">
          <HelpCircle className="w-5 h-5" />
        </button>

        <button className="relative text-gray-400 hover:text-gray-600 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0.5 w-2 h-2 bg-red-500 border-2 border-gray-50 rounded-full"></span>
        </button>

        <UserButton
          appearance={{
            elements: { avatarBox: 'w-10 h-10 ring-2 ring-white shadow-sm' },
          }}
        />
      </div>
    </header>
  );
}
