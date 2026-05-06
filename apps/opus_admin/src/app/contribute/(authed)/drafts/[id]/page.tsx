import { loadOwnedContributorDraft } from '@/lib/contribute/drafts'
import EditorClient from './EditorClient'

export const dynamic = 'force-dynamic'

export default async function ContributorDraftPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const draft = await loadOwnedContributorDraft(id)
  return <EditorClient initialDraft={draft} />
}
