import { AlertTriangle } from 'lucide-react'

// Surfaced when one or more underlying counter queries failed during
// snapshot build. Without this, a broken connection makes every card
// read "0" — visually indistinguishable from a healthy quiet day. The
// banner is intentionally low-key (not a full error page) because
// many counters did succeed and the dashboard is still useful.

export default function DashboardErrorBanner({
  errorCount,
}: {
  errorCount: number
}) {
  if (errorCount <= 0) return null
  return (
    <div
      role="status"
      className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900"
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="text-xs leading-relaxed">
        <p className="font-semibold">Some counters could not load</p>
        <p className="mt-0.5 text-amber-800">
          {errorCount === 1
            ? '1 dashboard query failed — a value below may read 0 even when the underlying state is not empty.'
            : `${errorCount} dashboard queries failed — values below may read 0 even when the underlying state is not empty.`}{' '}
          Check the server logs for details and refresh.
        </p>
      </div>
    </div>
  )
}
