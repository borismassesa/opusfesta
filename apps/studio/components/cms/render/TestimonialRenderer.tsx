import OptimizedImage from '../OptimizedImage';
import PreviewBanner from './PreviewBanner';
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin';
import type { StudioAsset } from '@/lib/cms/assets';

interface TestimonialContent {
  quote: string;
  author: string;
  role?: string;
  avatar?: { asset_id: string } | null;
  legacy_avatar_url?: string;
}

interface TestimonialRendererProps {
  content: TestimonialContent;
  isDraft: boolean;
}

async function fetchAsset(assetId: string | undefined): Promise<StudioAsset | null> {
  if (!assetId) return null;
  const sb = getStudioSupabaseAdmin();
  const { data } = await sb.from('studio_assets').select('*').eq('id', assetId).single();
  return (data as StudioAsset | null) ?? null;
}

export default async function TestimonialRenderer({ content, isDraft }: TestimonialRendererProps) {
  const avatarAsset = await fetchAsset(content.avatar?.asset_id);

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center py-20 px-6">
      {isDraft && <PreviewBanner />}

      <figure className="max-w-3xl border-4 border-brand-border bg-white p-10 lg:p-14 shadow-brutal">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="text-brand-accent mb-6">
          <path d="M10 11H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h4v7zm11 0h-4a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h4v7z" stroke="currentColor" strokeWidth="2"/>
        </svg>

        <blockquote className="text-2xl lg:text-3xl font-light leading-relaxed text-brand-dark mb-8">
          &ldquo;{content.quote || 'Testimonial quote'}&rdquo;
        </blockquote>

        <figcaption className="flex items-center gap-4 pt-6 border-t-2 border-brand-border/30">
          {avatarAsset ? (
            <div className="w-14 h-14 border-2 border-brand-border overflow-hidden rounded-full">
              <OptimizedImage asset={avatarAsset} width={200} className="w-full h-full object-cover" />
            </div>
          ) : content.legacy_avatar_url ? (
            <div className="w-14 h-14 border-2 border-brand-border overflow-hidden rounded-full">
              <img src={content.legacy_avatar_url} alt={content.author} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-14 h-14 border-2 border-brand-border bg-brand-accent flex items-center justify-center rounded-full">
              <span className="text-xl font-bold text-white">{(content.author || '?')[0]}</span>
            </div>
          )}
          <div>
            <p className="text-base font-bold text-brand-dark">{content.author || 'Anonymous'}</p>
            {content.role && <p className="text-sm text-neutral-500 font-light">{content.role}</p>}
          </div>
        </figcaption>
      </figure>
    </div>
  );
}
