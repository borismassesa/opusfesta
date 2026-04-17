import PortableText from '../PortableText';
import OptimizedImage from '../OptimizedImage';
import LegacyHtmlRenderer from '../LegacyHtmlRenderer';
import PreviewBanner from './PreviewBanner';
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin';
import type { StudioAsset } from '@/lib/cms/assets';

interface ArticleContent {
  title: string;
  slug: string;
  excerpt?: string;
  category?: string;
  author?: string;
  published_at?: string;
  body?: unknown;
  body_html?: string;
  cover_image?: { asset_id: string } | null;
  callouts?: Array<{ heading: string; body: string }>;
}

// Detect whether a Tiptap doc has real content vs being the empty default.
// Treats `{ type: 'doc', content: [{ type: 'paragraph' }] }` as empty so
// legacy articles fall through to the body_html fallback.
function richTextIsEmpty(value: unknown): boolean {
  if (!value || typeof value !== 'object') return true;
  const doc = value as { type?: string; content?: Array<{ type?: string; content?: unknown[] }> };
  if (doc.type !== 'doc') return true;
  const content = doc.content ?? [];
  if (content.length === 0) return true;
  // Single empty paragraph = empty
  if (content.length === 1 && content[0]?.type === 'paragraph' && !content[0]?.content) return true;
  return false;
}

interface ArticleRendererProps {
  content: ArticleContent;
  /** True if rendering from draft_content, false if from published_content */
  isDraft: boolean;
}

async function fetchAsset(assetId: string): Promise<StudioAsset | null> {
  const sb = getStudioSupabaseAdmin();
  const { data } = await sb.from('studio_assets').select('*').eq('id', assetId).single();
  return (data as StudioAsset | null) ?? null;
}

export default async function ArticleRenderer({ content, isDraft }: ArticleRendererProps) {
  const coverAsset = content.cover_image?.asset_id ? await fetchAsset(content.cover_image.asset_id) : null;

  return (
    <article className="bg-brand-bg py-16 lg:py-24">
      {isDraft && <PreviewBanner />}

      <div className="max-w-[900px] mx-auto px-6 lg:px-10">
        {/* Metadata row */}
        <div className="mb-6 flex flex-wrap items-center gap-3 text-[11px] font-mono uppercase tracking-[0.18em] text-neutral-500">
          {content.category && <span className="text-brand-accent">{content.category}</span>}
          {content.category && content.author && <span>·</span>}
          {content.author && <span>{content.author}</span>}
          {content.published_at && (
            <>
              <span>·</span>
              <time dateTime={content.published_at}>
                {new Date(content.published_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            </>
          )}
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-brand-dark leading-[0.95] mb-6">
          {content.title || 'Untitled'}
        </h1>

        {/* Excerpt */}
        {content.excerpt && (
          <p className="text-xl md:text-2xl text-neutral-600 font-light leading-relaxed mb-10">
            {content.excerpt}
          </p>
        )}

        {/* Cover image */}
        {coverAsset && (
          <div className="relative mb-12 aspect-[16/9] border-4 border-brand-border overflow-hidden">
            <OptimizedImage
              asset={coverAsset}
              width={1600}
              quality={85}
              priority
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Body — prefer Tiptap richtext, fall back to legacy HTML string. */}
        {richTextIsEmpty(content.body) && content.body_html ? (
          <LegacyHtmlRenderer
            html={content.body_html}
            className="prose prose-lg max-w-none text-brand-dark [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:mt-10 [&_h2]:mb-4 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mt-8 [&_h3]:mb-3 [&_p]:text-lg [&_p]:leading-relaxed [&_p]:my-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-brand-accent [&_blockquote]:pl-5 [&_blockquote]:italic [&_blockquote]:text-neutral-600 [&_blockquote]:my-6 [&_code]:bg-neutral-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono [&_code]:text-sm [&_a]:text-brand-accent [&_a]:underline"
          />
        ) : (
          <PortableText
            value={content.body}
            className="prose prose-lg max-w-none text-brand-dark [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:mt-10 [&_h2]:mb-4 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mt-8 [&_h3]:mb-3 [&_p]:text-lg [&_p]:leading-relaxed [&_p]:my-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-brand-accent [&_blockquote]:pl-5 [&_blockquote]:italic [&_blockquote]:text-neutral-600 [&_blockquote]:my-6 [&_code]:bg-neutral-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono [&_code]:text-sm [&_a]:text-brand-accent [&_a]:underline"
          />
        )}

        {/* Callouts */}
        {content.callouts && content.callouts.length > 0 && (
          <div className="mt-12 space-y-4">
            {content.callouts.map((callout, i) => (
              <aside
                key={i}
                className="border-l-4 border-brand-accent bg-white border-2 border-brand-border p-5 lg:p-6"
              >
                <h3 className="text-sm font-bold uppercase tracking-widest text-brand-accent mb-2">
                  {callout.heading}
                </h3>
                <p className="text-base leading-relaxed text-neutral-700">{callout.body}</p>
              </aside>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
