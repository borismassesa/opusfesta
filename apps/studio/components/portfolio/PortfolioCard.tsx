'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import type { PortfolioItem } from '@/lib/data';
import { toDisplayDate } from '@/lib/portfolio';

const ASPECT_RATIO_CLASSES: Record<PortfolioItem['aspectRatio'], string> = {
  '1:1': 'aspect-square',
  '4:5': 'aspect-[4/5]',
  '3:2': 'aspect-[3/2]',
  '16:9': 'aspect-video',
  '9:16': 'aspect-[9/16]',
};

interface PortfolioCardProps {
  item: PortfolioItem;
  onOpen: (item: PortfolioItem) => void;
}

export default function PortfolioCard({ item, onOpen }: PortfolioCardProps) {
  const [hasMediaError, setHasMediaError] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const thumbUrl = useMemo(() => {
    if (item.type === 'video') return item.posterUrl || item.thumbnailUrl;
    return item.thumbnailUrl || item.mediaUrl;
  }, [item]);

  const aspectClass = ASPECT_RATIO_CLASSES[item.aspectRatio] ?? ASPECT_RATIO_CLASSES['16:9'];

  return (
    <button
      type="button"
      onClick={() => onOpen(item)}
      className="group w-full overflow-hidden border-4 border-brand-border bg-brand-bg text-left transition-all duration-300 hover:shadow-brutal-lg"
      aria-label={`Open portfolio item ${item.title}`}
    >
      <div className={`relative ${aspectClass} overflow-hidden border-b-4 border-brand-border bg-brand-dark/10`}>
        {!hasMediaError ? (
          <>
            <Image
              src={thumbUrl}
              alt={item.alt || item.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              onError={() => setHasMediaError(true)}
              onLoad={() => setIsImageLoading(false)}
            />
            {isImageLoading && <div aria-hidden="true" className="absolute inset-0 animate-pulse bg-brand-dark/15" />}
          </>
        ) : (
          <div className="absolute inset-0 grid place-items-center bg-brand-dark/10 p-4">
            <span className="text-[10px] font-mono uppercase tracking-widest text-brand-dark/70">
              {item.type === 'video' ? 'Video Preview Unavailable' : 'Image Unavailable'}
            </span>
          </div>
        )}

        {item.type === 'video' && (
          <div className="absolute bottom-4 right-4 border-2 border-white/60 bg-black/60 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
            Video
          </div>
        )}
      </div>

      <div className="space-y-3 p-5">
        <div className="flex items-center justify-between gap-4">
          <span className="text-[10px] font-mono uppercase tracking-widest text-brand-accent">{item.category}</span>
          <span className="text-[10px] font-mono uppercase tracking-widest text-brand-muted">{toDisplayDate(item.date)}</span>
        </div>
        <h2 className="text-2xl font-bold uppercase tracking-tight text-brand-dark transition-colors duration-200 group-hover:text-brand-accent">
          {item.title}
        </h2>
        <p className="line-clamp-2 text-sm leading-relaxed text-neutral-600">{item.description}</p>
      </div>
    </button>
  );
}
