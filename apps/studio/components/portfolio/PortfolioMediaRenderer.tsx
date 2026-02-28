'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import type { PortfolioItem } from '@/lib/data';

interface PortfolioMediaRendererProps {
  item: PortfolioItem;
  zoomed: boolean;
  onToggleZoom: () => void;
}

function isEmbedVideo(item: PortfolioItem): boolean {
  return item.type === 'video' && Boolean(item.embedUrl && item.videoSourceType && item.videoSourceType !== 'mp4');
}

export default function PortfolioMediaRenderer({
  item,
  zoomed,
  onToggleZoom,
}: PortfolioMediaRendererProps) {
  const [hasMediaError, setHasMediaError] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const imageSource = useMemo(() => item.mediaUrl || item.thumbnailUrl, [item.mediaUrl, item.thumbnailUrl]);

  if (item.type === 'image') {
    if (hasMediaError) {
      return (
        <div className="grid h-full min-h-[280px] place-items-center bg-brand-dark/10 p-6 text-center">
          <p className="text-xs font-mono uppercase tracking-widest text-brand-dark/70">Image failed to load</p>
        </div>
      );
    }

    return (
      <button
        type="button"
        onClick={onToggleZoom}
        className="relative block h-full w-full cursor-zoom-in overflow-hidden bg-black"
        aria-label={zoomed ? 'Zoom out image' : 'Zoom in image'}
      >
        <Image
          src={imageSource}
          alt={item.alt || item.title}
          fill
          sizes="(max-width: 1024px) 100vw, 70vw"
          className={`object-contain transition-transform duration-300 motion-reduce:transition-none ${
            zoomed ? 'scale-[1.35] cursor-zoom-out' : 'scale-100'
          }`}
          onError={() => setHasMediaError(true)}
          priority
        />
      </button>
    );
  }

  if (isEmbedVideo(item) && item.embedUrl) {
    return (
      <div className="relative aspect-video w-full bg-black">
        <iframe
          src={item.embedUrl}
          title={`${item.title} video`}
          className="h-full w-full"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  if (videoError) {
    return (
      <div className="grid h-full min-h-[280px] place-items-center bg-brand-dark/10 p-6 text-center">
        <p className="text-xs font-mono uppercase tracking-widest text-brand-dark/70">Video failed to load</p>
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full bg-black">
      <video
        controls
        playsInline
        preload="metadata"
        poster={item.posterUrl || item.thumbnailUrl}
        className="h-full w-full"
        aria-label={`${item.title} video playback`}
        onError={() => setVideoError(true)}
      >
        <source src={item.mediaUrl} type="video/mp4" />
        Your browser does not support this video format.
      </video>
    </div>
  );
}
