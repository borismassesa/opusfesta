export default function RevisionsBanner({ notes, reviewedAt }: { notes: string | null; reviewedAt: string | null }) {
  if (!notes) return null
  return (
    <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
      <p className="font-semibold">Editor notes{reviewedAt ? ` · ${new Date(reviewedAt).toLocaleDateString()}` : ''}</p>
      <p className="mt-1 leading-6">{notes}</p>
    </div>
  )
}
