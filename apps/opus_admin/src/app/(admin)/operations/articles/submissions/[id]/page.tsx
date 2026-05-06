import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ArrowLeft, Pencil } from 'lucide-react'
import { createSupabaseAdminClient } from '@/lib/supabase'
import {
  type AdviceArticleSubmissionRow,
} from '@/lib/advice-submissions'
import type { AdviceIdeasBodySection, AdviceIdeasBlock } from '@/lib/cms/advice-ideas'
import StatusPill, {
  type StatusVariant,
} from '@/app/(admin)/operations/_shared/StatusPill'
import { formatRelativeTime } from '@/app/(admin)/operations/_shared/relativeTime'
import ReviewActions from './ReviewActions'

export const dynamic = 'force-dynamic'

const STATUS_PILL: Record<string, { variant: StatusVariant; label: string }> = {
  draft: { variant: 'draft', label: 'Draft' },
  pending: { variant: 'pending', label: 'Pending review' },
  submitted: { variant: 'pending', label: 'Pending review' },
  revisions: { variant: 'revisions', label: 'Revisions requested' },
  changes_requested: { variant: 'revisions', label: 'Revisions requested' },
  approved: { variant: 'approved', label: 'Approved' },
  published: { variant: 'published', label: 'Published' },
  rejected: { variant: 'rejected', label: 'Not accepted' },
}

export default async function ArticleSubmissionReviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('advice_article_submissions')
    .select('*')
    .eq('id', id)
    .maybeSingle<AdviceArticleSubmissionRow>()

  if (error) throw error
  if (!data) notFound()

  const pill = STATUS_PILL[data.status] ?? { variant: 'pending' as StatusVariant, label: data.status }
  const submitted = data.submitted_at ?? data.updated_at
  const author = data.author_name?.trim() || data.author_email
  const summary = data.excerpt?.trim() || data.description?.trim() || ''
  const cover = data.hero_media_src?.trim() || ''
  const wordCount = wordCountOf(data.body ?? [])

  return (
    <div className="bg-[#FAF6F1] pb-24">
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-4 px-8 py-5">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/operations/articles/submissions"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-950"
            >
              <ArrowLeft className="h-4 w-4" />
              Submissions
            </Link>
            <span className="h-5 w-px bg-gray-200" aria-hidden />
            <StatusPill variant={pill.variant} label={pill.label} />
            <span className="truncate text-sm text-gray-500">
              Submitted {formatRelativeTime(submitted)}
            </span>
          </div>
          <Link
            href={`/operations/articles/submissions/${id}/edit`}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            <Pencil className="h-3.5 w-3.5" />
            Open editor
          </Link>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1280px] grid-cols-[minmax(0,1fr)_320px] gap-10 px-8 py-10 max-lg:grid-cols-1">
        <article className="min-w-0 rounded-2xl border border-gray-100 bg-white p-10 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] sm:p-14">
          {cover && (
            <div className="relative -m-10 mb-10 aspect-[16/9] overflow-hidden rounded-t-2xl bg-gray-100 sm:-m-14 sm:mb-12">
              <Image
                src={cover}
                alt={data.hero_media_alt || ''}
                fill
                sizes="(max-width: 1024px) 100vw, 800px"
                className="object-cover"
                unoptimized
              />
            </div>
          )}
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#7E5896]">
            {data.category}
          </p>
          <h1 className="mt-3 text-3xl font-semibold leading-[1.15] tracking-[-0.02em] text-gray-950 sm:text-4xl">
            {data.title || 'Untitled draft'}
          </h1>
          {summary && (
            <p className="mt-5 text-lg leading-8 text-gray-600">{summary}</p>
          )}
          <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
            <span className="font-medium text-gray-800">{author}</span>
            <span aria-hidden>·</span>
            <span>{data.author_email}</span>
            <span aria-hidden>·</span>
            <span>{wordCount.toLocaleString()} words</span>
            <span aria-hidden>·</span>
            <span>{readingTimeLabel(wordCount)}</span>
          </div>

          <hr className="my-10 border-gray-100" />

          {(data.body?.length ?? 0) === 0 ? (
            <p className="text-sm italic text-gray-500">
              No body content yet. The contributor submitted an empty draft.
            </p>
          ) : (
            <ArticleBody sections={data.body ?? []} />
          )}
        </article>

        <ReviewActions
          submissionId={id}
          status={data.status}
          authorName={author}
          authorEmail={data.author_email}
          adminNotes={data.admin_notes}
          correctionNotes={data.correction_notes}
          sourcePostId={data.source_post_id}
          slug={data.slug}
          publishedAt={data.published_at ?? ''}
        />
      </div>
    </div>
  )
}

function ArticleBody({ sections }: { sections: AdviceIdeasBodySection[] }) {
  return (
    <div className="space-y-10 text-[17px] leading-[1.75] text-gray-800">
      {sections.map((section) => (
        <section key={section.id} className="space-y-5">
          {section.heading?.trim() && (
            <h2 className="text-2xl font-semibold leading-tight tracking-[-0.01em] text-gray-950">
              {section.heading}
            </h2>
          )}
          {section.blocks.map((block, idx) => (
            <BlockView key={`${section.id}-${idx}`} block={block} />
          ))}
        </section>
      ))}
    </div>
  )
}

function BlockView({ block }: { block: AdviceIdeasBlock }) {
  switch (block.type) {
    case 'paragraph':
      return <p>{block.text}</p>
    case 'subheading':
      return (
        <h3 className="pt-2 text-xl font-semibold leading-tight text-gray-950">
          {block.text}
        </h3>
      )
    case 'list':
      return block.ordered ? (
        <ol className="list-decimal space-y-2 pl-6">
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ol>
      ) : (
        <ul className="list-disc space-y-2 pl-6">
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      )
    case 'quote':
      return (
        <blockquote className="border-l-4 border-[#C9A0DC] pl-5 italic text-gray-700">
          <p>{block.quote}</p>
          {block.attribution && (
            <footer className="mt-2 text-sm not-italic text-gray-500">
              — {block.attribution}
            </footer>
          )}
        </blockquote>
      )
    case 'tip':
      return (
        <aside className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
          {block.title && (
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-800">
              {block.title}
            </p>
          )}
          <p className="mt-1 text-sm leading-7 text-amber-950">{block.text}</p>
        </aside>
      )
    case 'image':
      return (
        <figure className="my-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={block.src}
            alt={block.alt}
            className="w-full rounded-xl border border-gray-100 object-cover"
          />
          {block.caption && (
            <figcaption className="mt-2 text-sm text-gray-500">{block.caption}</figcaption>
          )}
        </figure>
      )
    case 'video':
      return (
        <figure className="my-2 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">
            Video embed
          </p>
          <a
            className="mt-2 block break-all text-[#7E5896] underline underline-offset-4"
            href={block.src}
            target="_blank"
            rel="noopener noreferrer"
          >
            {block.src}
          </a>
          {block.caption && (
            <figcaption className="mt-2 text-sm text-gray-500">{block.caption}</figcaption>
          )}
        </figure>
      )
    case 'gallery':
      return (
        <div className="grid grid-cols-2 gap-3">
          {block.items.map((item, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={item.src}
              alt={item.alt}
              className="aspect-square w-full rounded-lg border border-gray-100 object-cover"
            />
          ))}
        </div>
      )
    default:
      return null
  }
}

function wordCountOf(sections: AdviceIdeasBodySection[]): number {
  let count = 0
  for (const section of sections) {
    if (section.heading) count += countWords(section.heading)
    for (const block of section.blocks ?? []) {
      switch (block.type) {
        case 'paragraph':
        case 'subheading':
          count += countWords(block.text)
          break
        case 'list':
          for (const item of block.items) count += countWords(item)
          break
        case 'quote':
          count += countWords(block.quote)
          if (block.attribution) count += countWords(block.attribution)
          break
        case 'tip':
          count += countWords(block.title) + countWords(block.text)
          break
      }
    }
  }
  return count
}

function countWords(text: string): number {
  const trimmed = text.trim()
  return trimmed ? trimmed.split(/\s+/).length : 0
}

function readingTimeLabel(words: number): string {
  if (words < 60) return 'under 1 min'
  return `${Math.ceil(words / 200)} min read`
}
