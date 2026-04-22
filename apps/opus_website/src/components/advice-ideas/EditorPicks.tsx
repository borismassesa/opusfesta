import Link from 'next/link'
import Image from 'next/image'
import { PlayCircle, ArrowRight } from 'lucide-react'
import Byline from '@/components/advice-ideas/Byline'
import {
  ADVICE_IDEAS_BASE_PATH,
  heroThumb,
  type AdviceIdeasPost,
} from '@/lib/advice-ideas'

// Editorial layout: one big hero pick (2/3) + four stacked smaller picks
// (1/3) on desktop. Everything stacks on mobile. The hero gets a meaty
// excerpt + byline + read-time; the small cards lean on title + byline.
//
// Pass 5 posts; the component splits them 1 + 4. If fewer are supplied it
// renders what it has, gracefully.
export default function EditorPicks({ posts }: { posts: AdviceIdeasPost[] }) {
  if (posts.length === 0) return null
  const [hero, ...rest] = posts
  const stacked = rest.slice(0, 4)

  return (
    <section id="editor-picks" className="scroll-mt-20">
      {/* Section header — heading left, "View all" on the right */}
      <header className="mb-6 flex items-end justify-between gap-4 border-b border-slate-200 pb-3">
        <div>
          <h2 className="mb-2 text-xl font-bold text-slate-900 sm:text-2xl md:text-3xl">
            Our editor&rsquo;s picks
          </h2>
          <p className="max-w-3xl text-sm leading-relaxed text-slate-600">
            Welcome to the inspiration stage. The latest advice and trending
            ideas to help you design the best day ever.
          </p>
        </div>
        <Link
          href={`${ADVICE_IDEAS_BASE_PATH}#latest-stories`}
          className="hidden shrink-0 items-center gap-1.5 text-[13px] font-semibold text-[#1A1A1A] underline-offset-4 transition-colors hover:text-[var(--accent-hover)] hover:underline md:inline-flex"
        >
          View all
          <ArrowRight size={14} />
        </Link>
      </header>

      {/* Layout */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-12">
        <HeroPick post={hero} className="lg:col-span-2" />
        <div className="flex flex-col">
          {stacked.map((post) => (
            <StackedPick key={post.id} post={post} />
          ))}
        </div>
      </div>

      {/* Mobile "View all" — section-header version hides below md */}
      <div className="mt-10 flex justify-center md:hidden">
        <Link
          href={`${ADVICE_IDEAS_BASE_PATH}#latest-stories`}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 px-5 py-2.5 text-[13px] font-semibold text-[#1A1A1A] transition-colors hover:border-[var(--accent-hover)] hover:text-[var(--accent-hover)]"
        >
          View all articles
          <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  )
}

// ─── Hero pick (2/3 width) ───────────────────────────────────────────────
function HeroPick({ post, className = '' }: { post: AdviceIdeasPost; className?: string }) {
  const isVideo = post.heroMedia.type === 'video'
  return (
    <Link
      href={`${ADVICE_IDEAS_BASE_PATH}/${post.slug}`}
      className={`group flex flex-col ${className}`}
    >
      {/* Image — tighter to the headline (mb-4 instead of mb-6) */}
      <div className="relative mb-4 aspect-[3/2] w-full overflow-hidden rounded-lg bg-neutral-100">
        <Image
          src={heroThumb(post)}
          alt={post.heroMedia.alt}
          fill
          sizes="(min-width: 1024px) 60vw, 100vw"
          priority
          className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]"
        />
        {isVideo && (
          <div className="absolute bottom-4 left-4 rounded-full bg-black/50 p-1.5 text-white">
            <PlayCircle size={22} />
          </div>
        )}
      </div>

      {/* Category — bumped size + contrast */}
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent-hover)]">
        {post.category}
      </p>

      {/* Headline — bigger + tighter leading for stronger hierarchy */}
      <h3 className="mb-3 text-xl font-bold leading-[1.15] tracking-tight text-[#1A1A1A] transition-all group-hover:underline underline-offset-4 decoration-2 sm:text-2xl md:text-[28px]">
        {post.title}
      </h3>

      <p className="mb-4 max-w-2xl text-[15px] leading-relaxed text-gray-600">
        {post.excerpt}
      </p>

      <Byline post={post} withRole withReadTime />

      {/* Explicit CTA under the feature */}
      <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--accent-hover)] transition-transform group-hover:translate-x-1">
        Read story
        <ArrowRight size={14} />
      </span>
    </Link>
  )
}

// ─── Stacked small pick ──────────────────────────────────────────────────
function StackedPick({ post }: { post: AdviceIdeasPost }) {
  const isVideo = post.heroMedia.type === 'video'
  return (
    <Link
      href={`${ADVICE_IDEAS_BASE_PATH}/${post.slug}`}
      className="group grid grid-cols-[120px_1fr] gap-4 border-b border-slate-100 py-5 first:border-t-0 first:pt-0 last:border-b-0 last:pb-0 sm:grid-cols-[140px_1fr] sm:gap-5 sm:py-6"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-neutral-100">
        <Image
          src={heroThumb(post)}
          alt={post.heroMedia.alt}
          fill
          sizes="140px"
          className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.04]"
        />
        {isVideo && (
          <div className="absolute bottom-2 left-2 rounded-full bg-black/55 p-1 text-white">
            <PlayCircle size={16} />
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-col justify-center">
        {/* Stronger category label */}
        <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--accent-hover)]">
          {post.category}
        </p>
        <h3 className="mb-2 line-clamp-3 text-[15px] font-bold leading-[1.3] text-[#1A1A1A] transition-all group-hover:underline underline-offset-2 decoration-2 sm:text-[16px]">
          {post.title}
        </h3>
        <Byline post={post} compact />
      </div>
    </Link>
  )
}

