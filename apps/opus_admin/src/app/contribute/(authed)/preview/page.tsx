import { notFound } from 'next/navigation'
import EditorClient from '../drafts/[id]/EditorClient'
import type { ContributorDraft, ContributorSubmissionStatus } from '@/lib/contribute/types'

export const dynamic = 'force-dynamic'

const base = {
  author_email: 'preview@opusfesta.com',
  author_clerk_id: 'preview',
  category: 'Planning Guides',
  cover_image_url: '',
  cover_image_alt: '',
  source_post_id: null,
  slug: '',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  submitted_at: null,
  reviewed_at: null,
  review_notes: null,
}

export default function ContributorPreviewPage() {
  if (process.env.NODE_ENV === 'production') notFound()
  return (
    <div className="space-y-16">
      {mocks.map((draft) => (
        <section key={draft.id} className="border-b border-gray-200 pb-16 last:border-b-0">
          <div className="mx-auto max-w-[1200px] px-6 py-5">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#5B2D8E]">
              Preview state: {draft.id.replace('preview-', '')}
            </p>
          </div>
          <EditorClient initialDraft={draft} />
        </section>
      ))}
    </div>
  )
}

function mock(id: string, status: ContributorSubmissionStatus, overrides: Partial<ContributorDraft>): ContributorDraft {
  return {
    ...base,
    id: `preview-${id}`,
    status,
    title: '',
    summary: '',
    body: [],
    word_count: 0,
    ...overrides,
  }
}

const body = [
  {
    id: 'intro',
    heading: '',
    blocks: [
      {
        type: 'paragraph' as const,
        text: 'Venue decisions get easier when couples separate atmosphere, logistics, and guest comfort before touring spaces.',
      },
    ],
  },
]

const mocks: ContributorDraft[] = [
  mock('empty', 'draft', {}),
  mock('ready', 'draft', {
    title: 'How to choose a wedding venue without losing the plot',
    summary: 'A practical planning guide for narrowing the venue search before couples start booking tours.',
    body,
    word_count: 78,
  }),
  mock('cover', 'draft', {
    title: 'A coastal reception checklist',
    summary: 'What to confirm before committing to a waterside reception venue.',
    body,
    word_count: 84,
    cover_image_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    cover_image_alt: 'Wedding table setting near a coastal view',
  }),
  mock('pending', 'pending', {
    title: 'What couples should ask before signing a catering contract',
    summary: 'Questions that help reveal service style, timing, and hidden costs before the deposit is paid.',
    body,
    word_count: 91,
    submitted_at: new Date().toISOString(),
  }),
  mock('revisions', 'revisions', {
    title: 'A calm guide to guest list tradeoffs',
    summary: 'How couples can make guest list decisions with less pressure and clearer boundaries.',
    body,
    word_count: 89,
    review_notes: 'Please add one concrete example for handling plus-one decisions.',
    reviewed_at: new Date().toISOString(),
  }),
]
