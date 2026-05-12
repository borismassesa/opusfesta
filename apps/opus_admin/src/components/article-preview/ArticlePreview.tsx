'use client'

// Faithful preview of the public website's /advice-and-ideas/[slug] layout.
// Used by both the contributor PreviewModal and the admin PostEditor's
// Preview button so what the author sees here is exactly what the public
// article page renders. JSX mirrors apps/opus_website/src/app/advice-and-ideas/
// [slug]/page.tsx — when that public layout changes, mirror the change here.

import { Clock } from 'lucide-react'
import type { ReactNode } from 'react'
import type {
  AdviceIdeasBlock,
  AdviceIdeasBodySection,
  AdviceIdeasRichTextMark,
  AdviceIdeasRichTextNode,
} from '@/lib/cms/advice-ideas'

export type ArticlePreviewData = {
  title: string
  excerpt: string
  category: string
  authorName: string
  authorRole?: string
  authorAvatarUrl?: string
  readTime?: string
  date?: string
  heroMediaSrc?: string
  heroMediaAlt?: string
  heroMediaType?: 'image' | 'video'
  heroMediaPoster?: string
  body: AdviceIdeasBodySection[]
}

export default function ArticlePreview({ post }: { post: ArticlePreviewData }) {
  const tocItems = post.body
    .filter((s) => s.heading)
    .map((s) => ({ id: s.id, label: s.heading }))

  return (
    <article className="bg-white text-[#1A1A1A]">
      {/* Article header */}
      <header className="mx-auto max-w-4xl pl-3 pr-4 pt-6 pb-8 sm:px-4 sm:pt-8">
        <p className="inline-block text-[13px] font-semibold text-[var(--accent-hover,_#7E5896)]">
          {post.category || 'Uncategorised'}
        </p>
        <h1 className="mt-3 text-[28px] font-bold leading-[1.15] tracking-[-0.015em] text-[#1A1A1A] sm:text-[34px] md:text-[40px]">
          {post.title || 'Untitled article'}
        </h1>
        {post.excerpt && (
          <p className="mt-4 text-[17px] leading-relaxed text-gray-600 sm:text-[18px]">
            {post.excerpt}
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[13px] text-gray-500">
          <span className="inline-flex items-center gap-2 font-semibold text-[#1A1A1A]">
            <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-[#FAF7F2] text-[10px] font-bold uppercase tracking-wider text-[var(--accent-hover,_#7E5896)]">
              {post.authorAvatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={post.authorAvatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <span>{initialsFromName(post.authorName || 'Author')}</span>
              )}
            </span>
            {post.authorName || 'Author'}
          </span>
          {post.authorRole && (
            <>
              <span className="text-gray-300" aria-hidden>·</span>
              <span>{post.authorRole}</span>
            </>
          )}
          {post.date && (
            <>
              <span className="text-gray-300" aria-hidden>·</span>
              <time>{post.date}</time>
            </>
          )}
          {post.readTime && (
            <>
              <span className="text-gray-300" aria-hidden>·</span>
              <span className="inline-flex items-center gap-1">
                <Clock size={12} className="text-gray-400" aria-hidden />
                {post.readTime}
              </span>
            </>
          )}
        </div>
      </header>

      {/* Hero media */}
      {post.heroMediaSrc && (
        <figure className="mx-auto max-w-4xl pl-3 pr-4 sm:px-4">
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-gray-100">
            {post.heroMediaType === 'video' ? (
              // eslint-disable-next-line jsx-a11y/media-has-caption
              <video
                src={post.heroMediaSrc}
                poster={post.heroMediaPoster}
                autoPlay
                muted
                loop
                playsInline
                className="h-full w-full object-cover"
              />
            ) : (
              // Use a plain <img> instead of next/image — preview content
              // can come from any URL (Supabase storage, external) and we
              // don't need next/image's optimisation here.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.heroMediaSrc}
                alt={post.heroMediaAlt ?? ''}
                className="h-full w-full object-cover"
              />
            )}
          </div>
        </figure>
      )}

      {/* Body */}
      <div className="mx-auto max-w-4xl pl-3 pr-4 pt-12 pb-16 sm:px-4">
        <div id="article-body">
          {post.body.map((section, i) => (
            <PreviewSection key={section.id} section={section} index={i} />
          ))}
          {post.body.length === 0 && (
            <p className="text-sm italic text-gray-400">
              No body sections yet — switch back to the editor to add some.
            </p>
          )}
        </div>
      </div>

      {/* Quiet TOC under the body so reviewers can scan structure. Hidden if
          there are no headings to list. */}
      {tocItems.length > 0 && (
        <aside className="mx-auto max-w-4xl border-t border-gray-100 px-4 py-6 text-[13px] text-gray-500">
          <p className="mb-2 font-semibold uppercase tracking-[0.12em] text-gray-400">
            Sections
          </p>
          <ol className="list-decimal space-y-1 pl-5">
            {tocItems.map((item) => (
              <li key={item.id}>{item.label}</li>
            ))}
          </ol>
        </aside>
      )}
    </article>
  )
}

function PreviewSection({
  section,
  index,
}: {
  section: AdviceIdeasBodySection
  index: number
}) {
  return (
    <section id={section.id} className={index > 0 ? 'mt-12' : ''}>
      {section.label && (
        <p className="mb-2 text-[13px] font-semibold text-[var(--accent-hover,_#7E5896)]">
          {section.label}
        </p>
      )}
      {section.heading && (
        <h2 className="mb-5 text-[22px] font-bold leading-[1.25] tracking-[-0.005em] text-[#1A1A1A] sm:text-[26px]">
          {section.heading}
        </h2>
      )}
      <div className="space-y-5">
        {section.blocks.map((block, i) => (
          <BlockRenderer key={i} block={block} />
        ))}
      </div>
    </section>
  )
}

function BlockRenderer({ block }: { block: AdviceIdeasBlock }) {
  switch (block.type) {
    case 'paragraph':
      return (
        <p className="text-[16px] leading-[1.7] text-gray-700 sm:text-[17px]">
          <RichInline content={block.richText} fallback={block.text} />
        </p>
      )
    case 'list': {
      const Tag = block.ordered ? 'ol' : 'ul'
      return (
        <Tag
          className={`space-y-2.5 text-[16px] leading-[1.65] text-gray-700 sm:text-[17px] ${
            block.ordered ? 'list-decimal pl-6' : ''
          }`}
        >
          {block.items.map((item, i) => (
            <li
              key={i}
              className={
                block.ordered
                  ? 'pl-1 marker:font-semibold marker:text-[#1A1A1A]'
                  : 'relative pl-5 before:absolute before:left-0 before:top-[0.7em] before:h-[6px] before:w-[6px] before:rounded-full before:bg-[#1A1A1A]'
              }
            >
              {item}
            </li>
          ))}
        </Tag>
      )
    }
    case 'quote':
      return (
        <blockquote className="my-2 border-l-2 border-[var(--accent,_#C9A0DC)] pl-5">
          <p className="text-[18px] italic leading-[1.5] text-[#1A1A1A] sm:text-[19px]">
            “{block.quote}”
          </p>
          {block.attribution && (
            <footer className="mt-2 text-[13px] text-gray-500">
              — {block.attribution}
            </footer>
          )}
        </blockquote>
      )
    case 'tip':
      return (
        <aside className="my-2 rounded-lg bg-[#FAF7F2] p-5">
          <p className="mb-1 text-[13px] font-semibold text-[var(--accent-hover,_#7E5896)]">
            {block.title}
          </p>
          <p className="text-[15px] leading-[1.6] text-[#1A1A1A] sm:text-[16px]">
            {block.text}
          </p>
        </aside>
      )
    case 'subheading':
      return (
        <h3 className="mt-6 mb-1 text-[18px] font-bold leading-[1.3] text-[#1A1A1A] sm:text-[19px]">
          {block.text}
        </h3>
      )
    case 'image':
      return (
        <figure className="my-4 -mx-4 sm:mx-0">
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100 sm:rounded-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={block.src}
              alt={block.alt}
              className="h-full w-full object-cover"
            />
          </div>
          {block.caption && (
            <figcaption className="mt-2 px-4 text-[13px] italic leading-relaxed text-gray-500 sm:px-0">
              {block.caption}
            </figcaption>
          )}
        </figure>
      )
    case 'video':
      return (
        <figure className="my-4 -mx-4 sm:mx-0">
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100 sm:rounded-xl">
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video
              src={block.src}
              poster={block.poster}
              controls
              playsInline
              preload="metadata"
              className="h-full w-full object-cover"
              aria-label={block.alt}
            />
          </div>
          {block.caption && (
            <figcaption className="mt-2 px-4 text-[13px] italic leading-relaxed text-gray-500 sm:px-0">
              {block.caption}
            </figcaption>
          )}
        </figure>
      )
    case 'gallery':
      return (
        <div className="my-4 grid grid-cols-2 gap-2 sm:gap-3">
          {block.items.map((item, i) => (
            <div
              key={i}
              className="relative aspect-square overflow-hidden rounded-lg bg-gray-100"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.src}
                alt={item.alt}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      )
  }
}

function RichInline({
  content,
  fallback,
}: {
  content?: AdviceIdeasRichTextNode[]
  fallback: string
}) {
  if (!content?.length) return <>{fallback}</>
  return (
    <>
      {content.map((node, index) => {
        if (node.type === 'hardBreak') return <br key={index} />
        let child: ReactNode = node.text ?? ''
        for (const mark of node.marks ?? []) {
          child = renderRichMark(mark, child, index)
        }
        return <span key={index}>{child}</span>
      })}
    </>
  )
}

function renderRichMark(
  mark: AdviceIdeasRichTextMark,
  child: ReactNode,
  key: number
): ReactNode {
  switch (mark.type) {
    case 'bold':
      return <strong key={key}>{child}</strong>
    case 'italic':
      return <em key={key}>{child}</em>
    case 'underline':
      return <u key={key}>{child}</u>
    case 'strike':
      return <s key={key}>{child}</s>
    case 'code':
      return <code key={key} className="rounded bg-gray-100 px-1 py-0.5 text-[0.92em]">{child}</code>
    case 'superscript':
      return <sup key={key}>{child}</sup>
    case 'subscript':
      return <sub key={key}>{child}</sub>
    case 'highlight':
      return <mark key={key} className="rounded-sm bg-[#FAEEDA] px-0.5">{child}</mark>
    case 'link': {
      const href = safeHref(mark.attrs?.href)
      return href ? (
        <a key={key} href={href} className="font-medium text-[var(--accent-hover,_#7E5896)] underline underline-offset-2">
          {child}
        </a>
      ) : child
    }
    default:
      return child
  }
}

function safeHref(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const href = value.trim()
  if (!href) return null
  if (href.startsWith('/') || href.startsWith('#')) return href
  try {
    const url = new URL(href)
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol) ? href : null
  } catch {
    return null
  }
}

function initialsFromName(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 3)
}
