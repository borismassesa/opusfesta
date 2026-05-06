import type { ContributorSubmissionStatus } from '@/lib/contribute/types'

export default function LockedNotice({
  status,
  notes,
}: {
  status: ContributorSubmissionStatus
  notes: string | null
}) {
  const title =
    status === 'approved' || status === 'published'
      ? 'Published'
      : status === 'rejected'
        ? 'Not accepted'
        : 'In review'
  const body =
    status === 'approved' || status === 'published'
      ? 'This piece has been accepted by the editorial team.'
      : status === 'rejected'
        ? 'The editorial team passed on this draft.'
        : 'This draft is locked while an editor reviews it.'

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-3.5">
      <p className="text-[11px] font-bold uppercase tracking-[0.04em] text-gray-500">Status</p>
      <h2 className="mt-4 text-base font-semibold text-gray-950">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-gray-500">{body}</p>
      {notes && (
        <div className="mt-4 rounded-lg bg-gray-50 p-3 text-sm leading-6 text-gray-700">
          <p className="font-semibold text-gray-950">Reviewer notes</p>
          <p className="mt-1">{notes}</p>
        </div>
      )}
    </section>
  )
}
