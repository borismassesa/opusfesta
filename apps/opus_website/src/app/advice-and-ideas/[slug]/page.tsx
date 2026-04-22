import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Clock3,
  PlayCircle,
} from 'lucide-react'
import Byline from '@/components/advice-ideas/Byline'
import {
  ADVICE_IDEAS_BASE_PATH,
  adviceIdeasPosts,
  getAdviceIdeasPost,
  heroThumb,
  type AdviceIdeasBlock,
  type AdviceIdeasBodySection,
  type AdviceIdeasPost,
} from '@/lib/advice-ideas'

export function generateStaticParams() {
  return adviceIdeasPosts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = getAdviceIdeasPost(slug)

  if (!post) {
    return { title: 'Story Not Found | OpusFesta' }
  }

  return {
    title: `${post.title} | OpusFesta`,
    description: post.description,
  }
}

export default async function AdviceIdeasArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = getAdviceIdeasPost(slug)

  if (!post) {
    notFound()
  }

  const relatedPosts = getRelatedPosts(post)

  return (
    <main className="bg-[#FFFCF8] text-[#1A1A1A]">
      <section className="border-b border-slate-200 bg-[linear-gradient(180deg,#fffdf9_0%,#f8f1e8_100%)]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:py-10 lg:px-6 lg:py-12">
          <Link
            href={ADVICE_IDEAS_BASE_PATH}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-[var(--accent-hover)]"
          >
            <ArrowLeft size={16} />
            Back to ideas & advice
          </Link>

          <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_340px] lg:items-end lg:gap-12">
            <div className="max-w-4xl">
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-[var(--accent-hover)]">
                {post.category}
              </p>
              <h1 className="max-w-4xl text-4xl font-black leading-[0.98] tracking-tight text-[#1A1A1A] sm:text-5xl md:text-6xl xl:text-[4.5rem]">
                {post.title}
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-relaxed text-slate-600 md:text-xl">
                {post.excerpt}
              </p>

              <div className="mt-7">
                <Byline post={post} withRole withReadTime />
              </div>
            </div>

            <aside className="rounded-[1.75rem] border border-[#E9DFD2] bg-[#FFF8F0] p-6 shadow-[0_20px_50px_rgba(74,54,30,0.08)]">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--accent-hover)]">
                Story Snapshot
              </p>
              <div className="mt-5 space-y-4">
                <MetaRow
                  icon={<CalendarDays size={16} />}
                  label="Published"
                  value={post.date}
                />
                <MetaRow
                  icon={<Clock3 size={16} />}
                  label="Read time"
                  value={post.readTime}
                />
                <MetaRow
                  icon={<span className="block h-2.5 w-2.5 rounded-full bg-[var(--accent-hover)]" />}
                  label="Section"
                  value={post.category}
                />
              </div>

              <div className="mt-6 rounded-2xl bg-white/80 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  In this article
                </p>
                <ul className="mt-4 space-y-3">
                  {post.body.map((section, index) => (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        className="group flex items-start gap-3 text-sm leading-relaxed text-slate-700 transition-colors hover:text-[#1A1A1A]"
                      >
                        <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-300 text-[11px] font-bold text-slate-500 transition-colors group-hover:border-[var(--accent-hover)] group-hover:text-[var(--accent-hover)]">
                          {index + 1}
                        </span>
                        <span>{section.heading}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 pb-10 sm:pb-12 lg:px-6 lg:pb-16">
          <div className="relative overflow-hidden rounded-[2rem] bg-slate-100 shadow-[0_30px_80px_rgba(15,23,42,0.15)]">
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_40%,rgba(0,0,0,0.18)_100%)]" />
            <div className="relative aspect-[16/10] sm:aspect-[16/9]">
              <Image
                src={heroThumb(post)}
                alt={post.heroMedia.alt}
                fill
                priority
                sizes="(min-width: 1280px) 1200px, 100vw"
                className="object-cover object-center"
              />
              {post.heroMedia.type === 'video' && (
                <div className="absolute bottom-5 left-5 rounded-full bg-black/60 p-2.5 text-white backdrop-blur-sm">
                  <PlayCircle size={24} />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <article className="mx-auto max-w-7xl px-4 py-14 sm:py-16 lg:px-6 lg:py-20">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-16">
          <div className="space-y-16">
            {post.body.map((section) => (
              <ArticleSection key={section.id} section={section} />
            ))}
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--accent-hover)]">
                Editorial Note
              </p>
              <p className="mt-4 text-[15px] leading-7 text-slate-600">
                The strongest wedding stories here are practical first and aspirational second. Read this piece for decisions you can actually use, not just details that photograph well.
              </p>

              <div className="mt-6 border-t border-slate-200 pt-6">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  Next move
                </p>
                <Link
                  href={ADVICE_IDEAS_BASE_PATH}
                  className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#1A1A1A] transition-colors hover:text-[var(--accent-hover)]"
                >
                  Browse more stories
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </article>

      {relatedPosts.length > 0 && (
        <section className="border-t border-slate-200 bg-[#FAF7F2] px-4 py-16 sm:py-20 lg:px-6">
          <div className="mx-auto max-w-7xl">
            <header className="mb-8 flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--accent-hover)]">
                  Continue Reading
                </p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-[#1A1A1A]">
                  More stories worth opening
                </h2>
              </div>
              <Link
                href={ADVICE_IDEAS_BASE_PATH}
                className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#1A1A1A] underline-offset-4 transition-colors hover:text-[var(--accent-hover)] hover:underline"
              >
                Back to the hub
                <ArrowRight size={14} />
              </Link>
            </header>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {relatedPosts.map((relatedPost) => (
                <RelatedPostCard key={relatedPost.id} post={relatedPost} />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}

function getRelatedPosts(post: AdviceIdeasPost) {
  const sameSection = adviceIdeasPosts.filter(
    (candidate) => candidate.sectionId === post.sectionId && candidate.id !== post.id,
  )
  const fallback = adviceIdeasPosts.filter(
    (candidate) =>
      candidate.sectionId !== post.sectionId && candidate.id !== post.id,
  )

  return [...sameSection, ...fallback].slice(0, 3)
}

function MetaRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm">
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
          {label}
        </p>
        <p className="mt-1 text-sm font-medium leading-relaxed text-[#1A1A1A]">
          {value}
        </p>
      </div>
    </div>
  )
}

function ArticleSection({ section }: { section: AdviceIdeasBodySection }) {
  return (
    <section id={section.id} className="scroll-mt-24">
      {section.label && (
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-[var(--accent-hover)]">
          {section.label}
        </p>
      )}
      <h2 className="max-w-4xl text-3xl font-black leading-[1.02] tracking-tight text-[#1A1A1A] md:text-[2.7rem]">
        {section.heading}
      </h2>
      <div className="mt-7 space-y-7">
        {section.blocks.map((block, index) => (
          <ArticleBlock key={`${section.id}-${index}`} block={block} />
        ))}
      </div>
    </section>
  )
}

function ArticleBlock({ block }: { block: AdviceIdeasBlock }) {
  if (block.type === 'paragraph') {
    return (
      <p className="max-w-3xl text-[18px] leading-8 text-slate-700 md:text-[19px]">
        {block.text}
      </p>
    )
  }

  if (block.type === 'list') {
    const ListTag = block.ordered ? 'ol' : 'ul'
    return (
      <ListTag
        className={`max-w-3xl space-y-3 pl-6 text-[18px] leading-8 text-slate-700 marker:text-[var(--accent-hover)] md:text-[19px] ${block.ordered ? 'list-decimal' : 'list-disc'}`}
      >
        {block.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ListTag>
    )
  }

  if (block.type === 'quote') {
    return (
      <figure className="max-w-3xl rounded-[1.75rem] border border-slate-200 bg-[#FAF7F2] p-7 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
        <blockquote className="text-2xl font-medium leading-relaxed tracking-tight text-[#1A1A1A]">
          &ldquo;{block.quote}&rdquo;
        </blockquote>
        {block.attribution && (
          <figcaption className="mt-5 text-sm font-medium text-slate-500">
            {block.attribution}
          </figcaption>
        )}
      </figure>
    )
  }

  return (
    <div className="max-w-3xl rounded-[1.5rem] border border-[var(--accent)]/25 bg-[var(--accent)]/10 p-6 md:p-7">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent-hover)]">
        {block.title}
      </p>
      <p className="mt-4 text-[18px] leading-8 text-slate-700 md:text-[19px]">
        {block.text}
      </p>
    </div>
  )
}

function RelatedPostCard({ post }: { post: AdviceIdeasPost }) {
  return (
    <Link
      href={`${ADVICE_IDEAS_BASE_PATH}/${post.slug}`}
      className="group flex h-full flex-col rounded-[1.6rem] border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-shadow hover:shadow-[0_14px_40px_rgba(15,23,42,0.08)]"
    >
      <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-[1.2rem] bg-slate-100">
        <Image
          src={heroThumb(post)}
          alt={post.heroMedia.alt}
          fill
          sizes="(min-width: 768px) 30vw, 100vw"
          className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--accent-hover)]">
        {post.category}
      </p>
      <h3 className="mb-3 text-[18px] font-bold leading-[1.2] text-[#1A1A1A] transition-all group-hover:underline underline-offset-2 decoration-2">
        {post.title}
      </h3>
      <p className="mb-4 text-[15px] leading-7 text-slate-600">
        {post.excerpt}
      </p>
      <div className="mt-auto">
        <Byline post={post} compact />
      </div>
    </Link>
  )
}
