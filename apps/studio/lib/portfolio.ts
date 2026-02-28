import {
  portfolioItems,
  type PortfolioAspectRatio,
  type PortfolioItem,
  type PortfolioMediaType,
  type VideoSourceType,
} from '@/lib/data';

const ALLOWED_TYPES: PortfolioMediaType[] = ['image', 'video'];
const ALLOWED_VIDEO_TYPES: VideoSourceType[] = ['mp4', 'youtube', 'vimeo'];
const ALLOWED_ASPECTS: PortfolioAspectRatio[] = ['1:1', '4:5', '3:2', '16:9', '9:16'];

function hasValue(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isValidDate(value: string): boolean {
  return !Number.isNaN(new Date(value).getTime());
}

function warnInvalidPortfolioItem(id: string, reason: string) {
  if (process.env.NODE_ENV !== 'development') return;
  // eslint-disable-next-line no-console
  console.warn(`[portfolio] Excluding invalid item "${id}": ${reason}`);
}

function toSafeAspectRatio(value: string | undefined): PortfolioAspectRatio {
  if (value && ALLOWED_ASPECTS.includes(value as PortfolioAspectRatio)) {
    return value as PortfolioAspectRatio;
  }
  return '16:9';
}

function normalizeVideoSource(value: string | undefined): VideoSourceType | undefined {
  if (!value) return undefined;
  if (ALLOWED_VIDEO_TYPES.includes(value as VideoSourceType)) {
    return value as VideoSourceType;
  }
  return undefined;
}

function normalizeItem(item: PortfolioItem): PortfolioItem | null {
  const requiredStrings = ['id', 'slug', 'title', 'mediaUrl', 'thumbnailUrl', 'category', 'description', 'date'] as const;
  for (const key of requiredStrings) {
    if (!hasValue(item[key])) {
      warnInvalidPortfolioItem(item.id || 'unknown', `Missing required field "${key}"`);
      return null;
    }
  }

  if (!ALLOWED_TYPES.includes(item.type)) {
    warnInvalidPortfolioItem(item.id, 'Unknown media type');
    return null;
  }

  const normalized: PortfolioItem = {
    ...item,
    tags: Array.isArray(item.tags) ? item.tags.filter((tag) => hasValue(tag)) : [],
    featured: Boolean(item.featured),
    aspectRatio: toSafeAspectRatio(item.aspectRatio),
    date: isValidDate(item.date) ? item.date : 'Unknown date',
    videoSourceType: normalizeVideoSource(item.videoSourceType),
  };

  if (normalized.type === 'video') {
    const hasHostedVideo = hasValue(normalized.mediaUrl);
    const hasEmbedVideo = hasValue(normalized.embedUrl) && Boolean(normalized.videoSourceType);
    if (!hasHostedVideo && !hasEmbedVideo) {
      warnInvalidPortfolioItem(item.id, 'Video item requires mediaUrl or embedUrl + videoSourceType');
      return null;
    }
  }

  return normalized;
}

export function getPortfolioItems(): PortfolioItem[] {
  return portfolioItems
    .map(normalizeItem)
    .filter((item): item is PortfolioItem => item !== null);
}

export function getPortfolioItemBySlug(slug: string): PortfolioItem | undefined {
  return getPortfolioItems().find((item) => item.slug === slug);
}

export function getPortfolioCategories(items: PortfolioItem[]): string[] {
  return [...new Set(items.map((item) => item.category))].sort((a, b) => a.localeCompare(b));
}

export function getPortfolioTags(items: PortfolioItem[]): string[] {
  return [...new Set(items.flatMap((item) => item.tags))].sort((a, b) => a.localeCompare(b));
}

export function toDisplayDate(value: string): string {
  if (!isValidDate(value)) return value;
  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(new Date(value));
}
