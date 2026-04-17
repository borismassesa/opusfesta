import OptimizedImage from '../OptimizedImage';
import PreviewBanner from './PreviewBanner';
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin';
import type { StudioAsset } from '@/lib/cms/assets';

interface ServiceContent {
  title: string;
  description: string;
  price?: string;
  cover_image?: { asset_id: string } | null;
  legacy_cover_image_url?: string;
  includes?: Array<{ text: string }>;
}

interface ServiceRendererProps {
  content: ServiceContent;
  isDraft: boolean;
}

async function fetchAsset(assetId: string | undefined): Promise<StudioAsset | null> {
  if (!assetId) return null;
  const sb = getStudioSupabaseAdmin();
  const { data } = await sb.from('studio_assets').select('*').eq('id', assetId).single();
  return (data as StudioAsset | null) ?? null;
}

export default async function ServiceRenderer({ content, isDraft }: ServiceRendererProps) {
  const coverAsset = await fetchAsset(content.cover_image?.asset_id);

  return (
    <div className="min-h-screen bg-brand-bg py-16 lg:py-24">
      {isDraft && <PreviewBanner />}

      <div className="max-w-[1100px] mx-auto px-6 lg:px-10">
        <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-brand-accent mb-4">
          Service
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-10 lg:gap-14 items-start mb-12">
          <div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-brand-dark leading-[0.95] mb-4">
              {content.title || 'Untitled service'}
            </h1>
            {content.price && (
              <p className="text-2xl font-mono font-bold text-brand-accent mb-6">{content.price}</p>
            )}
            <p className="text-lg lg:text-xl text-neutral-700 leading-relaxed font-light whitespace-pre-wrap">
              {content.description}
            </p>
          </div>

          {coverAsset ? (
            <div className="relative aspect-[4/3] border-4 border-brand-border overflow-hidden">
              <OptimizedImage asset={coverAsset} width={1200} className="w-full h-full object-cover" />
            </div>
          ) : content.legacy_cover_image_url ? (
            <div className="relative aspect-[4/3] border-4 border-brand-border overflow-hidden">
              <img src={content.legacy_cover_image_url} alt={content.title} className="w-full h-full object-cover" />
            </div>
          ) : null}
        </div>

        {content.includes && content.includes.length > 0 && (
          <div className="border-4 border-brand-border bg-white p-8 lg:p-10">
            <h2 className="text-[11px] font-bold text-brand-dark tracking-[0.14em] uppercase font-mono mb-6">
              Includes
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {content.includes.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-base text-neutral-700">
                  <span className="w-2 h-2 bg-brand-accent mt-2 shrink-0" />
                  <span className="font-light">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
