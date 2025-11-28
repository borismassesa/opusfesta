'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, Heart, SlidersHorizontal, Gem, Instagram, Twitter, Facebook } from 'lucide-react';
import { CATEGORIES, MOCK_SHOTS } from '../home-data';
import Navbar from '../../components/home/navbar';
import VendorMarquee from '../../components/home/vendor-marquee';

const footerLinks = [
  {
    title: 'Planning Tools',
    links: [
      { label: 'Checklist', href: '#' },
      { label: 'Budgeter', href: '#' },
      { label: 'Guest List', href: '#' },
    ],
  },
  {
    title: 'Marketplace',
    links: [
      { label: 'Venues', href: '#' },
      { label: 'Photographers', href: '#' },
      { label: 'Florists', href: '#' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Contact', href: '#' },
    ],
  },
];

const InspirationPageContent = () => {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  const [activeCategory, setActiveCategory] = useState(categoryParam || 'Popular');
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  useEffect(() => {
    if (categoryParam) {
      setActiveCategory(categoryParam);
    }
  }, [categoryParam]);

  const filteredShots = activeCategory === 'Popular'
    ? MOCK_SHOTS
    : MOCK_SHOTS.filter(shot => shot.category === activeCategory);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar />

      {/* Category Filter Bar */}
      <div className="border-b border-gray-100 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-[1400px] px-6">
          <div className="flex items-center justify-between gap-4 py-4">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
              {CATEGORIES.map((category, index) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`flex-shrink-0 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                    activeCategory === category
                      ? 'bg-slate-900 text-white shadow-sm hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-50'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowFiltersModal(true)}
              className="flex flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:shadow dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600"
            >
              <SlidersHorizontal size={16} />
              Filters
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {filteredShots.map(shot => (
            <div key={shot.id} className="flex flex-col gap-3">
              <article className="relative aspect-[4/3] overflow-hidden rounded-[22px] bg-white shadow-sm ring-1 ring-gray-100 transition duration-300 hover:-translate-y-1 hover:shadow-md dark:bg-slate-900/60 dark:ring-slate-800">
                <Image
                  src={shot.image}
                  alt={shot.title}
                  fill
                  sizes="(min-width: 1280px) 24vw, (min-width: 768px) 48vw, 100vw"
                  className="object-cover transition-transform duration-500 hover:scale-105"
                  priority={false}
                />
              </article>
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <Image
                    src={`https://picsum.photos/seed/${shot.id}/48/48`}
                    alt={shot.author}
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                  <span className="text-sm font-semibold text-gray-900 dark:text-slate-100">{shot.author}</span>
                  <span className="rounded bg-gray-200 px-1.5 text-[10px] font-bold uppercase text-gray-500 dark:bg-slate-800 dark:text-slate-200">
                    Pro
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs font-semibold text-gray-600 dark:text-slate-300">
                  <span className="inline-flex items-center gap-1">
                    <Heart size={14} className="fill-gray-400 dark:fill-slate-300" />
                    {shot.likes}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Eye size={14} />
                    {(shot.views ?? 0) / 1000}k
                  </span>
                </div>
              </div>
              <div className="px-1">
                <p className="text-sm text-gray-600 line-clamp-1 dark:text-slate-300">{shot.title}</p>
              </div>
            </div>
          ))}
        </div>

        {filteredShots.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-lg font-medium text-gray-900 dark:text-slate-100">No inspiration found</p>
            <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">Try selecting a different category</p>
          </div>
        )}
      </div>

      {/* Filters Modal (placeholder) */}
      {showFiltersModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowFiltersModal(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">Filters</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-slate-400">Filter options coming soon...</p>
            <button
              type="button"
              onClick={() => setShowFiltersModal(false)}
              className="mt-6 w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-50"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Vendor Marquee */}
      <VendorMarquee />

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-festa-section pb-8 pt-16 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
            <div className="col-span-2 lg:col-span-2">
              <Link href="/" className="mb-6 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sage-50 text-sage-700 dark:bg-slate-900 dark:text-sage-200">
                  <Gem className="h-4 w-4" />
                </div>
                <span className="font-display text-xl font-medium text-slate-900 dark:text-white">TheFesta</span>
              </Link>
              <p className="mb-6 max-w-xs text-sm text-slate-500 dark:text-slate-300">
                The ultimate wedding planning ecosystem. Connecting couples with top-tier vendors for unforgettable
                celebrations.
              </p>
              <div className="flex gap-4 text-slate-400 dark:text-slate-500">
                <a href="#" className="transition-colors hover:text-sage-600 dark:hover:text-sage-400" aria-label="Instagram">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="transition-colors hover:text-sage-600 dark:hover:text-sage-400" aria-label="Twitter">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="transition-colors hover:text-sage-600 dark:hover:text-sage-400" aria-label="Facebook">
                  <Facebook className="h-5 w-5" />
                </a>
              </div>
            </div>

            {footerLinks.map(section => (
              <div key={section.title}>
                <h4 className="mb-4 font-medium text-slate-900 dark:text-white">{section.title}</h4>
                <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-300">
                  {section.links.map(link => (
                    <li key={link.label}>
                      <a href={link.href} className="transition-colors hover:text-sage-600 dark:hover:text-sage-400">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-8 text-xs text-slate-400 md:flex-row dark:border-slate-800">
            <p>© 2024 TheFesta Inc. All rights reserved.</p>
            <div className="flex items-center gap-2">
              <span>Made with</span>
              <Heart className="h-3 w-3 text-rose-400" fill="currentColor" />
              <span>for couples everywhere.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const InspirationPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InspirationPageContent />
    </Suspense>
  );
};

export default InspirationPage;
