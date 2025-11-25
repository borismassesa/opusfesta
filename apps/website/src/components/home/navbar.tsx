'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Bell, ChevronDown, Menu, Search, X } from 'lucide-react';
import { NAV_LINKS } from '../../app/home-data';

const Navbar = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showPromo, setShowPromo] = useState(true);

  useEffect(() => {
    const updateNavbarHeight = () => {
      if (containerRef.current) {
        const height = containerRef.current.offsetHeight;
        document.documentElement.style.setProperty('--navbar-height', `${height}px`);
      }
    };

    updateNavbarHeight();
    window.addEventListener('resize', updateNavbarHeight);
    return () => window.removeEventListener('resize', updateNavbarHeight);
  }, [showPromo]);

  return (
    <div
      ref={containerRef}
      className="relative flex w-full flex-col bg-[#f8f7f4] text-gray-900 dark:bg-[#0f1116] dark:text-slate-200"
    >
      {showPromo && (
        <div className="flex items-center justify-between bg-dribbble-dark px-4 py-3 text-xs text-white transition-all duration-300 md:text-sm">
          <div className="flex-1 text-center">
            <span className="mr-2 rounded bg-white px-1 text-[10px] font-bold uppercase tracking-wider text-dribbble-dark">Pro</span>
            <span className="opacity-90">Top vendors get 10X more leads and zero commission fees on TheFesta.</span>
            <a href="#" className="ml-2 underline transition-colors hover:text-gray-300">
              List your business &rarr;
            </a>
          </div>
          <button
            type="button"
            onClick={() => setShowPromo(false)}
            className="ml-4 text-gray-400 transition-colors hover:text-white"
            aria-label="Close promotion banner"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <nav className="sticky top-0 z-50 flex w-full items-center justify-between border-b border-gray-100 bg-white px-4 py-4 dark:border-slate-800 dark:bg-[#0f1116]/95 md:py-5 lg:px-6">
        <div className="flex items-center gap-4 lg:gap-8">
          <button
            type="button"
            className="text-gray-900 dark:text-slate-100 lg:hidden"
            onClick={() => setIsMenuOpen(open => !open)}
            aria-expanded={isMenuOpen}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <Link
            href="/"
            className="select-none font-display text-2xl text-gray-900 transition-colors hover:text-gray-700 dark:text-white dark:hover:text-slate-200 md:text-3xl"
          >
            TheFesta
          </Link>

          <ul className="hidden items-center gap-4 text-sm font-medium text-gray-600 dark:text-slate-300 lg:flex xl:gap-6">
            {NAV_LINKS.map(link => (
              <li key={link.label} className="group relative">
                <a
                  href={link.href}
                  className="flex items-center gap-0.5 whitespace-nowrap py-2 transition-colors hover:text-gray-900 dark:hover:text-white"
                >
                  {link.label}
                  {link.hasDropdown && <ChevronDown size={14} className="transition-transform duration-200 group-hover:rotate-180" />}
                </a>
                {link.hasDropdown && (
                  <div className="invisible absolute left-0 top-full z-50 mt-1 w-56 origin-top-left rounded-lg border border-gray-200 bg-white opacity-0 shadow-xl transition-all duration-200 group-hover:visible group-hover:opacity-100 dark:border-slate-800 dark:bg-[#11141c]">
                    <div className="p-2">
                      <a
                        href="#"
                        className="block rounded-md px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 dark:text-slate-200 dark:hover:bg-slate-900/60"
                      >
                        All {link.label}
                      </a>
                      <a
                        href="#"
                        className="block rounded-md px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 dark:text-slate-200 dark:hover:bg-slate-900/60"
                      >
                        Top Rated
                      </a>
                      <a
                        href="#"
                        className="block rounded-md px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 dark:text-slate-200 dark:hover:bg-slate-900/60"
                      >
                        Trending Now
                      </a>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-3 md:gap-6">
          <button type="button" className="hidden text-gray-500 transition-colors hover:text-gray-900 dark:text-slate-300 dark:hover:text-white sm:block">
            <Search size={20} />
          </button>

          <button type="button" className="relative text-gray-500 transition-colors hover:text-gray-900 dark:text-slate-300 dark:hover:text-white">
            <Bell size={20} />
            <span className="absolute right-0 top-0 h-2 w-2 -translate-y-1/4 translate-x-1/4 rounded-full border-2 border-white bg-dribbble-pink" />
          </button>

          <a href="#" className="hidden lg:block">
            <Image
              src="https://picsum.photos/seed/bride/100/100"
              alt="User avatar"
              width={40}
              height={40}
              className="h-8 w-8 rounded-full border border-gray-200 object-cover dark:border-slate-700 md:h-10 md:w-10"
            />
          </a>

          <a
            href="#"
            className="hidden whitespace-nowrap rounded-full bg-dribbble-dark px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-700 sm:block"
          >
            For Vendors
          </a>
        </div>
      </nav>

      {isMenuOpen && (
        <div className="absolute left-0 top-full z-40 w-full max-h-[80vh] overflow-y-auto border-b border-gray-200 bg-white p-4 shadow-xl animate-fade-in dark:border-slate-800 dark:bg-[#0f1116] lg:hidden">
          {NAV_LINKS.map(link => (
            <a
              key={link.label}
              href={link.href}
              className="border-b border-gray-50 py-3 text-base font-medium text-gray-700 dark:border-slate-800 dark:text-slate-200"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-4 pb-2">
            <a href="#" className="block w-full rounded-full bg-dribbble-dark px-4 py-3 text-center font-bold text-white">
              List Your Business
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
