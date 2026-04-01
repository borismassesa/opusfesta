'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { createPortal } from 'react-dom';
import type { StudioProject } from '@/lib/studio-types';

type GalleryKind = 'Photo' | 'Video';
type SortBy = 'Newest' | 'A-Z' | 'Video First';

interface GalleryItem {
  id: string;
  title: string;
  category: string;
  kind: GalleryKind;
  order: number;
  image: string;
  videoUrl?: string;
  views: string;
}

interface PortfolioGridProps {
  projects?: StudioProject[];
}

function parseViewValue(value: string): number | null {
  const normalized = value.replace(/,/g, '').replace(/\+/g, '').trim();
  const match = normalized.match(/^([\d.]+)\s*([kKmMbB])?$/);
  if (!match) return null;

  const amount = Number(match[1]);
  if (Number.isNaN(amount)) return null;

  const suffix = match[2]?.toLowerCase();
  if (suffix === 'k') return Math.round(amount * 1_000);
  if (suffix === 'm') return Math.round(amount * 1_000_000);
  if (suffix === 'b') return Math.round(amount * 1_000_000_000);
  return Math.round(amount);
}

function formatViews(count: number): string {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (count >= 10_000) {
    return `${Math.round(count / 1_000)}K`;
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  }
  return `${count}`;
}

export default function PortfolioGrid({ projects = [] }: PortfolioGridProps) {
  const LIGHTBOX_HINT_KEY = 'portfolio-lightbox-hint-seen';
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('Newest');
  const [cardMediaLoaded, setCardMediaLoaded] = useState<Record<string, boolean>>({});
  const [previewMediaLoaded, setPreviewMediaLoaded] = useState(false);
  const [showLightboxHint, setShowLightboxHint] = useState(false);
  const [isPortalMounted, setIsPortalMounted] = useState(false);

  const previewVideoRef = useRef<HTMLVideoElement | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const hasSeenLightboxHintRef = useRef(true);

  const galleryItems = useMemo<GalleryItem[]>(
    () =>
      projects.flatMap((project, index) => {
        const stats = Array.isArray(project.stats) ? project.stats : [];
        const baseViews =
          parseViewValue(
            stats.find((stat) => stat.label.toLowerCase().includes('view'))?.value || ''
          ) ||
          4_800 + index * 1_350;

        const items: GalleryItem[] = [];

        // Always include the cover image as the primary photo
        items.push({
          id: `${project.id}-cover`,
          title: project.title,
          category: project.category,
          kind: 'Photo' as GalleryKind,
          order: index,
          image: project.cover_image,
          views: formatViews(baseViews),
        });

        // Add gallery images if present
        if (Array.isArray(project.gallery_images)) {
          project.gallery_images.forEach((img, i) => {
            if (!img) return;
            items.push({
              id: `${project.id}-gallery-${i}`,
              title: `${project.title} - Gallery ${i + 1}`,
              category: project.category,
              kind: 'Photo' as GalleryKind,
              order: index,
              image: img,
              views: formatViews(Math.round(baseViews * 0.85) + i * 123),
            });
          });
        }

        // Add Video if present
        if (project.video_url) {
          items.push({
            id: `${project.id}-video`,
            title: `${project.title} Reel`,
            category: project.category,
            kind: 'Video' as GalleryKind,
            order: index,
            image: project.cover_image, // Use cover as poster
            videoUrl: project.video_url,
            views: formatViews(Math.round(baseViews * 1.35)),
          });
        }

        return items;
      }),
    [projects]
  );

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(projects.map((project) => project.category)))],
    [projects]
  );

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredItems = useMemo(() => {
    const filtered = galleryItems.filter((item) => {
      const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
      const matchesSearch =
        normalizedQuery.length === 0 ||
        item.title.toLowerCase().includes(normalizedQuery) ||
        item.category.toLowerCase().includes(normalizedQuery);
      return matchesCategory && matchesSearch;
    });

    const sorted = [...filtered];
    if (sortBy === 'A-Z') {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'Video First') {
      sorted.sort((a, b) => {
        if (a.kind !== b.kind) return a.kind === 'Video' ? -1 : 1;
        return a.order - b.order;
      });
    } else {
      sorted.sort((a, b) => a.order - b.order);
    }

    return sorted;
  }, [galleryItems, categoryFilter, normalizedQuery, sortBy]);

  const hasActiveFilters =
    categoryFilter !== 'All' || normalizedQuery.length > 0 || sortBy !== 'Newest';

  const setPreviewQuery = useCallback(
    (itemId: string | null, mode: 'push' | 'replace' = 'replace') => {
      const params = new URLSearchParams(searchParams.toString());
      if (itemId) {
        params.set('item', itemId);
      } else {
        params.delete('item');
      }

      const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      if (mode === 'push') {
        router.push(nextUrl, { scroll: false });
      } else {
        router.replace(nextUrl, { scroll: false });
      }
    },
    [pathname, router, searchParams]
  );

  const activePreviewIdFromQuery = searchParams.get('item');
  const activePreviewId = useMemo(() => {
    if (!activePreviewIdFromQuery) return null;
    return galleryItems.some((item) => item.id === activePreviewIdFromQuery)
      ? activePreviewIdFromQuery
      : null;
  }, [activePreviewIdFromQuery, galleryItems]);

  const previewSequence = useMemo(() => {
    if (activePreviewId && filteredItems.some((item) => item.id === activePreviewId)) {
      return filteredItems;
    }
    return galleryItems;
  }, [activePreviewId, filteredItems, galleryItems]);

  const activePreviewIndex = useMemo(
    () => previewSequence.findIndex((item) => item.id === activePreviewId),
    [previewSequence, activePreviewId]
  );

  const activePreviewItem =
    activePreviewIndex >= 0 ? previewSequence[activePreviewIndex] : null;

  useEffect(() => {
    if (activePreviewIdFromQuery && !activePreviewId) {
      setPreviewQuery(null, 'replace');
    }
  }, [activePreviewIdFromQuery, activePreviewId, setPreviewQuery]);

  useEffect(() => {
    if (!activePreviewId) {
      previewVideoRef.current?.pause();
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [activePreviewId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    hasSeenLightboxHintRef.current = localStorage.getItem(LIGHTBOX_HINT_KEY) === '1';
    setIsPortalMounted(true);
  }, []);

  useEffect(() => {
    if (activePreviewId) {
      setPreviewMediaLoaded(false);
    }
  }, [activePreviewId]);

  useEffect(() => {
    if (!activePreviewId) {
      setShowLightboxHint(false);
      return;
    }

    if (hasSeenLightboxHintRef.current) return;

    setShowLightboxHint(true);
    hasSeenLightboxHintRef.current = true;
    if (typeof window !== 'undefined') {
      localStorage.setItem(LIGHTBOX_HINT_KEY, '1');
    }

    const timeout = window.setTimeout(() => {
      setShowLightboxHint(false);
    }, 2800);

    return () => window.clearTimeout(timeout);
  }, [activePreviewId]);

  const pausePreviewVideo = useCallback(() => {
    if (previewVideoRef.current) {
      previewVideoRef.current.pause();
    }
  }, []);

  const openPreview = useCallback(
    (id: string) => {
      setPreviewQuery(id, 'push');
    },
    [setPreviewQuery]
  );

  const closePreview = useCallback(() => {
    pausePreviewVideo();
    setPreviewQuery(null, 'replace');
  }, [pausePreviewVideo, setPreviewQuery]);

  const openPrevious = useCallback(() => {
    if (activePreviewIndex > 0) {
      pausePreviewVideo();
      setPreviewQuery(previewSequence[activePreviewIndex - 1].id, 'replace');
    }
  }, [activePreviewIndex, previewSequence, pausePreviewVideo, setPreviewQuery]);

  const openNext = useCallback(() => {
    if (activePreviewIndex < previewSequence.length - 1) {
      pausePreviewVideo();
      setPreviewQuery(previewSequence[activePreviewIndex + 1].id, 'replace');
    }
  }, [activePreviewIndex, previewSequence, pausePreviewVideo, setPreviewQuery]);

  useEffect(() => {
    if (!activePreviewId) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closePreview();
      } else if (event.key === 'ArrowRight') {
        openNext();
      } else if (event.key === 'ArrowLeft') {
        openPrevious();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [activePreviewId, closePreview, openNext, openPrevious]);

  const markCardMediaLoaded = useCallback((id: string) => {
    setCardMediaLoaded((prev) => (prev[id] ? prev : { ...prev, [id]: true }));
  }, []);

  const lightbox = activePreviewItem ? (
    <div className="fixed inset-0 z-[1000]">
      <button
        type="button"
        aria-label="Close preview"
        onClick={closePreview}
        className="absolute inset-0 z-0 bg-black/70 backdrop-blur-sm"
      />
      <div role="dialog" aria-modal="true" className="relative z-10 h-full w-full overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={activePreviewItem.image}
            alt=""
            fill
            sizes="100vw"
            className="object-cover scale-110 blur-3xl opacity-35"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-black/45" />
        </div>

        <div
          className="relative flex h-full w-full items-center justify-center p-3 sm:p-5 lg:p-8"
          onTouchStart={(event) => {
            const touch = event.changedTouches[0];
            touchStartRef.current = { x: touch.clientX, y: touch.clientY };
          }}
          onTouchEnd={(event) => {
            if (!touchStartRef.current) return;

            const touch = event.changedTouches[0];
            const deltaX = touch.clientX - touchStartRef.current.x;
            const deltaY = touch.clientY - touchStartRef.current.y;
            touchStartRef.current = null;

            if (Math.abs(deltaX) < 52 || Math.abs(deltaX) < Math.abs(deltaY) * 1.2) {
              return;
            }

            if (deltaX < 0) {
              openNext();
            } else {
              openPrevious();
            }
          }}
        >
          <div className="relative h-full w-full">
            {activePreviewItem.kind === 'Video' && activePreviewItem.videoUrl ? (
              <video
                ref={previewVideoRef}
                key={activePreviewItem.id}
                src={activePreviewItem.videoUrl}
                poster={activePreviewItem.image}
                controls
                playsInline
                autoPlay
                preload="metadata"
                onLoadedData={() => setPreviewMediaLoaded(true)}
                className="h-full w-full object-contain"
              />
            ) : (
              <Image
                src={activePreviewItem.image}
                alt={activePreviewItem.title}
                fill
                sizes="(max-width: 640px) 92vw, (max-width: 1024px) 88vw, 82vw"
                className="object-contain"
                onLoad={() => setPreviewMediaLoaded(true)}
              />
            )}

            <div
              className={`pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
                previewMediaLoaded ? 'opacity-0' : 'opacity-100'
              }`}
            >
              <div className="h-full w-full animate-pulse bg-gradient-to-br from-white/15 via-white/5 to-white/10" />
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0 z-50">
          <div
            className="absolute right-0 top-0 pr-3 sm:pr-4"
            style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}
          >
            <button
              type="button"
              onClick={closePreview}
              className="pointer-events-auto h-12 w-12 rounded-full border border-white/80 bg-brand-dark text-white shadow-[0_10px_26px_rgba(0,0,0,0.45)] hover:bg-brand-accent hover:border-brand-accent transition-colors backdrop-blur-sm inline-flex items-center justify-center"
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6L6 18M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <button
            type="button"
            onClick={openPrevious}
            disabled={activePreviewIndex <= 0}
            className="pointer-events-auto absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-12 w-12 sm:h-11 sm:w-11 rounded-full border border-white/35 bg-black/45 text-white disabled:opacity-35 disabled:cursor-not-allowed hover:text-brand-accent hover:border-brand-accent transition-colors backdrop-blur-sm"
            aria-label="Previous"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto"
            >
              <path d="m15 18-6-6 6-6"></path>
            </svg>
          </button>

          <button
            type="button"
            onClick={openNext}
            disabled={activePreviewIndex >= previewSequence.length - 1}
            className="pointer-events-auto absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 h-12 w-12 sm:h-11 sm:w-11 rounded-full border border-white/35 bg-black/45 text-white disabled:opacity-35 disabled:cursor-not-allowed hover:text-brand-accent hover:border-brand-accent transition-colors backdrop-blur-sm"
            aria-label="Next"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto"
            >
              <path d="m9 18 6-6-6-6"></path>
            </svg>
          </button>

          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-mono uppercase tracking-[0.16em] text-white/80 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm">
            {activePreviewIndex + 1} / {previewSequence.length}
          </p>
          <div
            className={`absolute bottom-14 left-1/2 -translate-x-1/2 transition-all duration-500 ${
              showLightboxHint ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
          >
            <p className="whitespace-nowrap rounded-full border border-white/25 bg-black/45 px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.14em] text-white/90 backdrop-blur-sm sm:px-4">
              Swipe or use arrow keys. Press Esc to close.
            </p>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <section className="relative z-10 py-24 bg-brand-bg overflow-hidden">
        <div className="pointer-events-none absolute -top-10 -left-10 h-48 w-48 rounded-full bg-brand-accent/10 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-1/3 h-56 w-56 rounded-full bg-brand-accent/10 blur-3xl" />

        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="mb-14 lg:mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-brand-border/20 pb-8">
            <div>
              <span className="text-xs font-bold text-brand-accent tracking-widest uppercase font-mono mb-6 block">
                Portfolio
              </span>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-brand-dark leading-[0.9]">
                VISUAL
                <br />
                <span className="text-stroke">GALLERY.</span>
              </h1>
            </div>
            <div className="flex flex-col items-start md:items-end gap-3">
              <p className="text-neutral-500 text-base lg:text-lg max-w-sm leading-relaxed font-light md:text-right">
                Explore a curated archive of films, frames, and campaign moments from our latest productions.
              </p>
            </div>
          </div>

          <div className="mb-10 bg-white/80 border border-brand-border/10 p-4 lg:p-5 lg:sticky lg:top-[5.5rem] z-20 backdrop-blur-md shadow-[0_10px_24px_rgba(0,0,0,0.06)]">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-neutral-600">
                Filter Work
              </p>
              <div className="flex items-center gap-3">
                <p className="text-[11px] font-mono uppercase tracking-[0.15em] text-neutral-500">
                  {filteredItems.length} results
                </p>
                {hasActiveFilters ? (
                  <button
                    onClick={() => {
                      setCategoryFilter('All');
                      setSearchQuery('');
                      setSortBy('Newest');
                    }}
                    className="text-[11px] font-bold uppercase tracking-widest text-brand-dark hover:text-brand-accent transition-colors"
                  >
                    Reset
                  </button>
                ) : null}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-3 lg:gap-4 items-center">
              <div className="overflow-x-auto pb-1">
                <div className="flex w-max gap-2 pr-1">
                  {categories.map((category) => {
                    const active = categoryFilter === category;
                    return (
                      <button
                        key={category}
                        onClick={() => setCategoryFilter(category)}
                        className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest border transition-all duration-200 whitespace-nowrap rounded-full ${
                          active
                            ? 'bg-brand-accent border-brand-accent text-white'
                            : 'bg-white border-brand-border/20 text-neutral-600 hover:border-brand-accent hover:text-brand-accent'
                        }`}
                      >
                        {category}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2 w-full lg:w-auto lg:justify-self-end">
                <label className="relative block flex-1 lg:flex-none lg:w-[300px]">
                  <span className="sr-only">Search portfolio</span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search project..."
                    className="w-full h-10 pl-10 pr-10 border border-brand-border/30 bg-white text-brand-dark text-sm font-medium placeholder:text-neutral-400 focus:outline-none focus:border-brand-accent transition-colors rounded-full"
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
                    aria-hidden="true"
                  >
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.3-4.3"></path>
                  </svg>
                  {searchQuery ? (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-brand-accent transition-colors"
                      aria-label="Clear search"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M18 6L6 18M6 6l12 12"></path>
                      </svg>
                    </button>
                  ) : null}
                </label>

                <label htmlFor="portfolio-sort" className="sr-only">
                  Sort portfolio
                </label>
                <select
                  id="portfolio-sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  className="h-10 px-3 text-[10px] font-bold uppercase tracking-widest border border-brand-border/30 bg-white text-brand-dark focus:outline-none focus:border-brand-accent rounded-full"
                >
                  <option>Newest</option>
                  <option>A-Z</option>
                  <option>Video First</option>
                </select>
              </div>
            </div>
          </div>

          {filteredItems.length === 0 ? (
            <div className="border border-brand-border/25 bg-brand-panel p-10 text-center">
              <p className="text-2xl font-bold text-brand-dark tracking-tight mb-2">
                No results found
              </p>
              <p className="text-neutral-600 mb-6">
                Try another search term or clear filters to browse all work.
              </p>
              <button
                onClick={() => {
                  setCategoryFilter('All');
                  setSearchQuery('');
                  setSortBy('Newest');
                }}
                className="inline-flex items-center gap-2 px-5 py-3 bg-brand-dark text-white text-xs font-bold uppercase tracking-widest border-2 border-brand-dark shadow-brutal-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1 hover:bg-brand-accent hover:border-brand-accent transition-all duration-200"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="columns-1 md:columns-2 xl:columns-3 gap-5 lg:gap-6 [column-fill:_balance]">
              {filteredItems.map((item) => {
                const isCardLoaded = Boolean(cardMediaLoaded[item.id]);

                return (
                  <article
                    key={item.id}
                    className="group mb-5 lg:mb-6 break-inside-avoid bg-brand-dark hover:translate-y-[-2px] transition-all duration-200 shadow-[0_10px_24px_rgba(0,0,0,0.18)]"
                  >
                    <button
                      type="button"
                      onClick={() => openPreview(item.id)}
                      className="block w-full text-left"
                      aria-label={`Open preview for ${item.title}`}
                    >
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw"
                          className="object-cover"
                          onLoad={() => markCardMediaLoaded(item.id)}
                        />

                        <div
                          className={`absolute inset-0 animate-pulse bg-gradient-to-br from-white/20 via-white/10 to-white/20 transition-opacity duration-300 ${
                            isCardLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'
                          }`}
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/75 via-brand-dark/20 to-transparent" />

                        {item.kind === 'Video' ? (
                          <div className="absolute right-3 bottom-3 w-9 h-9 bg-brand-dark/70 backdrop-blur-sm flex items-center justify-center text-white rounded-full">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              aria-hidden="true"
                            >
                              <path d="M8 5v14l11-7z"></path>
                            </svg>
                          </div>
                        ) : null}
                      </div>

                      <div className="p-5 bg-brand-bg">
                        <h3 className="text-xl font-bold text-brand-dark tracking-tight leading-tight mb-3">
                          {item.title}
                        </h3>
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest bg-white text-brand-dark font-mono rounded-full">
                              {item.kind}
                            </span>
                            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest bg-brand-panel/40 text-neutral-700 font-mono rounded-full">
                              {item.category}
                            </span>
                          </div>
                          <span className="inline-flex shrink-0 items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.12em] text-neutral-500">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                            {item.views}
                          </span>
                        </div>
                      </div>
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
      {isPortalMounted && lightbox ? createPortal(lightbox, document.body) : null}
    </>
  );
}
