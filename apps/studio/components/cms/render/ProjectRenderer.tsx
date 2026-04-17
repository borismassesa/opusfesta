import OptimizedImage from '../OptimizedImage';
import PreviewBanner from './PreviewBanner';
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin';
import type { StudioAsset } from '@/lib/cms/assets';

interface ProjectContent {
  title: string;
  slug: string;
  number?: string;
  category?: string;
  description?: string;
  full_description?: string;
  cover_image?: { asset_id: string } | null;
  legacy_cover_image_url?: string;
  video_url?: string;
  stats?: Array<{ label: string; value: string }>;
  highlights?: Array<{ text: string }>;
}

interface ProjectRendererProps {
  content: ProjectContent;
  isDraft: boolean;
}

async function fetchAsset(assetId: string | undefined): Promise<StudioAsset | null> {
  if (!assetId) return null;
  const sb = getStudioSupabaseAdmin();
  const { data } = await sb.from('studio_assets').select('*').eq('id', assetId).single();
  return (data as StudioAsset | null) ?? null;
}

export default async function ProjectRenderer({ content, isDraft }: ProjectRendererProps) {
  const coverAsset = await fetchAsset(content.cover_image?.asset_id);

  return (
    <article className="bg-brand-bg py-16 lg:py-24">
      {isDraft && <PreviewBanner />}

      <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            {content.number && (
              <span className="text-[11px] font-mono text-brand-accent tracking-[0.18em]">
                PROJECT {content.number}
              </span>
            )}
            {content.category && (
              <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-neutral-500 mt-1">
                {content.category}
              </p>
            )}
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-brand-dark leading-[0.92] mb-8">
          {content.title || 'Untitled project'}
        </h1>

        {content.description && (
          <p className="text-xl md:text-2xl text-neutral-600 font-light leading-relaxed max-w-3xl mb-12">
            {content.description}
          </p>
        )}

        {coverAsset ? (
          <div className="relative mb-12 aspect-[16/9] border-4 border-brand-border overflow-hidden">
            <OptimizedImage
              asset={coverAsset}
              width={1920}
              quality={85}
              priority
              className="w-full h-full object-cover"
            />
          </div>
        ) : content.legacy_cover_image_url ? (
          <div className="relative mb-12 aspect-[16/9] border-4 border-brand-border overflow-hidden">
            <img
              src={content.legacy_cover_image_url}
              alt={content.title}
              loading="eager"
              decoding="async"
              className="w-full h-full object-cover"
            />
          </div>
        ) : null}

        {content.stats && content.stats.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {content.stats.map((stat, i) => (
              <div key={i} className="border-4 border-brand-border bg-white p-5 lg:p-6">
                <p className="text-3xl lg:text-4xl font-bold text-brand-dark font-mono tracking-tight mb-1">
                  {stat.value}
                </p>
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.16em]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-10 lg:gap-14">
          {content.full_description && (
            <div className="border border-brand-border/30 bg-white p-6 lg:p-8">
              <h2 className="text-[11px] font-bold text-brand-dark tracking-[0.14em] uppercase font-mono mb-4">
                Project overview
              </h2>
              <p className="text-neutral-700 text-base lg:text-lg leading-relaxed font-light whitespace-pre-wrap">
                {content.full_description}
              </p>
            </div>
          )}

          {content.highlights && content.highlights.length > 0 && (
            <div className="border border-brand-border/30 bg-brand-panel/40 p-6 lg:p-8">
              <h2 className="text-[11px] font-bold text-brand-dark tracking-[0.14em] uppercase font-mono mb-5">
                Key highlights
              </h2>
              <ul className="space-y-4">
                {content.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-brand-accent mt-2 shrink-0" />
                    <span className="text-neutral-700 font-light leading-relaxed">{h.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
