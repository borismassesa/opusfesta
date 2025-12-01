'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { EyeIcon, BookmarkIcon } from '@heroicons/react/24/outline';
import { HeartIcon, BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import { getVendors } from '../../lib/db/vendors';
import type { Vendor } from '../../types/database.types';

const ShotGrid = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVendors() {
      try {
        const data = await getVendors({ limit: 8 });
        setVendors(data);
      } catch (error) {
        console.error('Error fetching vendors:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchVendors();
  }, []);

  if (loading) {
    return (
      <section className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center py-20">
          <p className="text-gray-500 dark:text-slate-400">Loading vendors...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {vendors.map(vendor => (
          <div key={vendor.id} className="flex flex-col gap-3">
            <Link href={`/vendors/${vendor.slug}`}>
              <article className="group relative aspect-[4/3] overflow-hidden rounded-[22px] bg-white shadow-sm ring-1 ring-gray-100 transition duration-300 hover:-translate-y-1 hover:shadow-md dark:bg-slate-900/60 dark:ring-slate-800 cursor-pointer">
                <Image
                  src={vendor.coverImage || 'https://picsum.photos/seed/default/600/450'}
                  alt={vendor.businessName || 'Wedding vendor'}
                  fill
                  sizes="(min-width: 1280px) 24vw, (min-width: 768px) 48vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  priority={false}
                />
                {/* Hover Overlay with Save & Like Buttons */}
                <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="absolute bottom-3 right-3 flex gap-2">
                    <button
                      onClick={(e) => e.preventDefault()}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-700 shadow-lg transition-all hover:bg-white hover:scale-110 dark:bg-white dark:text-gray-700">
                      <BookmarkIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={(e) => e.preventDefault()}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-700 shadow-lg transition-all hover:bg-white hover:scale-110 hover:text-rose-500 dark:bg-white dark:text-gray-700">
                      <HeartIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </article>
            </Link>
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Image
                  src={vendor.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(vendor.businessName)}&background=random&size=48`}
                  alt={`${vendor.businessName} logo`}
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-full object-cover"
                />
                <span className="text-sm font-semibold text-gray-900 dark:text-slate-100">{vendor.businessName}</span>
                {vendor.tier !== 'free' && (
                  <span className="rounded bg-gray-200 px-1.5 text-[10px] font-bold uppercase text-gray-500 dark:bg-slate-800 dark:text-slate-200">
                    {vendor.tier}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-gray-600 dark:text-slate-300">
                <span className="inline-flex items-center gap-1">
                  <HeartIcon className="h-3.5 w-3.5 text-gray-400 dark:text-slate-300" />
                  {vendor.stats?.saveCount || 0}
                </span>
                <span className="inline-flex items-center gap-1">
                  <EyeIcon className="h-3.5 w-3.5" />
                  {((vendor.stats?.viewCount || 0) / 1000).toFixed(1)}k
                </span>
              </div>
            </div>
            <div className="px-1">
              <p className="text-sm text-gray-600 line-clamp-1 dark:text-slate-300">{vendor.category}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ShotGrid;
