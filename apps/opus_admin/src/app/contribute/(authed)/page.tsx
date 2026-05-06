import { createSupabaseAdminClient } from '@/lib/supabase'
import { requireContributorIdentity } from '@/lib/contribute/auth'
import { displayStatus, type ContributorDraft } from '@/lib/contribute/types'
import { rowToContributorDraft } from '@/lib/contribute/drafts'
import DraftsList from './_components/DraftsList'
import EmptyState from './_components/EmptyState'
import NewDraftButton from './_components/NewDraftButton'

export const dynamic = 'force-dynamic'

export default async function ContributePage({
  searchParams,
}: {
  searchParams?: Promise<{ submitted?: string }>
}) {
  const params = await searchParams
  const identity = await requireContributorIdentity()
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('advice_article_submissions')
    .select('*')
    .or(`author_clerk_id.eq.${identity.clerkId},author_email.ilike.${identity.email}`)
    .order('updated_at', { ascending: false })

  if (error) throw error
  const drafts = (data ?? []).map(rowToContributorDraft)

  const working = drafts.filter((draft) =>
    ['draft', 'revisions'].includes(displayStatus(draft.status))
  )
  const pending = drafts.filter((draft) => displayStatus(draft.status) === 'pending')
  const published = drafts.filter(
    (draft) => ['approved', 'published'].includes(displayStatus(draft.status)) && draft.source_post_id
  )
  const subtitle = `${working.length.toLocaleString()} drafts · ${pending.length.toLocaleString()} pending review · ${published.length.toLocaleString()} published`

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-10">
      {params?.submitted === '1' && (
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          Submitted - we&apos;ll let you know.
        </div>
      )}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-950">Your drafts</h1>
          <p className="mt-2 text-sm text-gray-500">{subtitle}</p>
        </div>
        <NewDraftButton />
      </div>

      {drafts.length === 0 ? (
        <EmptyState />
      ) : (
        <DraftsList
          sections={visibleSections([
            { id: 'drafts', title: 'Drafts', drafts: working },
            { id: 'pending', title: 'In review', drafts: pending },
            { id: 'published', title: 'Published', drafts: published },
          ])}
        />
      )}
    </div>
  )
}

function visibleSections(
  sections: Array<{ id: 'drafts' | 'pending' | 'published'; title: string; drafts: ContributorDraft[] }>
) {
  return sections.filter((section) => section.drafts.length > 0)
}
