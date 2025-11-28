'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { EyeIcon, AdjustmentsHorizontalIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { HeartIcon } from '@heroicons/react/24/solid';
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
              <AdjustmentsHorizontalIcon className="h-4 w-4" />
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
                    <HeartIcon className="h-3.5 w-3.5 text-gray-400 dark:text-slate-300" />
                    {shot.likes}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <EyeIcon className="h-3.5 w-3.5" />
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
                  <SparklesIcon className="h-4 w-4" />
                </div>
                <span className="font-display text-xl font-medium text-slate-900 dark:text-white">TheFesta</span>
              </Link>
              <p className="mb-6 max-w-xs text-sm text-slate-500 dark:text-slate-300">
                The ultimate wedding planning ecosystem. Connecting couples with top-tier vendors for unforgettable
                celebrations.
              </p>
              <div className="flex gap-4 text-slate-400 dark:text-slate-500">
                <a href="#" className="transition-colors hover:text-sage-600 dark:hover:text-sage-400" aria-label="Instagram">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
                  </svg>
                </a>
                <a href="#" className="transition-colors hover:text-sage-600 dark:hover:text-sage-400" aria-label="Twitter">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a href="#" className="transition-colors hover:text-sage-600 dark:hover:text-sage-400" aria-label="Facebook">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
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
              <HeartIcon className="h-3 w-3 text-rose-400" />
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
