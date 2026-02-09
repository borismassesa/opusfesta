import React, { useEffect, useMemo, useState } from 'react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackLabel?: string;
  fallbackSrc?: string;
}

const DEFAULT_FALLBACK_LABEL = 'OpusFesta';
const DEFAULT_FALLBACK_SRC = '/images/advice-ideas/post-1.webp';

function makeFallbackDataUri(label: string): string {
  const safeLabel = (label || DEFAULT_FALLBACK_LABEL).slice(0, 48);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#f6f1ea"/>
        <stop offset="100%" stop-color="#ece3d7"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="900" fill="url(#bg)"/>
    <g fill="none" stroke="#d9c9b6" stroke-width="3" opacity="0.7">
      <circle cx="210" cy="200" r="120"/>
      <circle cx="980" cy="710" r="180"/>
    </g>
    <text x="600" y="470" text-anchor="middle" fill="#7f7164" font-size="34" font-family="Arial, sans-serif">${safeLabel}</text>
  </svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt = '',
  fallbackLabel,
  fallbackSrc,
  loading = 'lazy',
  ...rest
}) => {
  const generatedFallback = useMemo(
    () => makeFallbackDataUri(fallbackLabel || alt || DEFAULT_FALLBACK_LABEL),
    [fallbackLabel, alt]
  );
  const fallback = fallbackSrc || DEFAULT_FALLBACK_SRC;
  const finalFallback = generatedFallback;
  const [currentSrc, setCurrentSrc] = useState(src || fallback);
  const [attemptedPrimaryFallback, setAttemptedPrimaryFallback] = useState(false);

  useEffect(() => {
    setCurrentSrc(src || fallback);
    setAttemptedPrimaryFallback(false);
  }, [src, fallback]);

  return (
    <img
      {...rest}
      src={currentSrc}
      alt={alt}
      loading={loading}
      onError={() => {
        if (currentSrc !== fallback) {
          setCurrentSrc(fallback);
          setAttemptedPrimaryFallback(true);
          return;
        }

        if (attemptedPrimaryFallback && currentSrc !== finalFallback) {
          setCurrentSrc(finalFallback);
        }
      }}
    />
  );
};
