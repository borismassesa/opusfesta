'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { CheckCircle2, XCircle, ExternalLink, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { reviewCategoryRequest } from './actions'
import type { CategoryRequestRow } from './page'

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-800 border-amber-200',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-gray-100 text-gray-500 border-gray-200',
}

export default function CategoryRequestsClient({ requests }: { requests: CategoryRequestRow[] }) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const act = (id: string, status: 'approved' | 'rejected') => {
    setError(null)
    startTransition(async () => {
      const result = await reviewCategoryRequest(id, status)
      if (!result.ok) setError(result.error)
    })
  }

  const pending = requests.filter((r) => r.status === 'pending')
  const resolved = requests.filter((r) => r.status !== 'pending')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Category Requests</h1>
        <p className="mt-1 text-sm text-gray-500">
          Vendors who selected "Something else" during onboarding. Approve to promote the label to a real category via{' '}
          <Link href="/operations/categories" className="underline hover:no-underline">Vendor Categories</Link>.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {pending.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-6 py-12 text-center">
          <Tag className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No pending category requests.</p>
        </div>
      )}

      {pending.length > 0 && (
        <Section title={`Pending (${pending.length})`}>
          <RequestTable requests={pending} isPending={isPending} onAct={act} />
        </Section>
      )}

      {resolved.length > 0 && (
        <Section title="Resolved">
          <RequestTable requests={resolved} isPending={isPending} onAct={act} />
        </Section>
      )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{title}</h2>
      {children}
    </div>
  )
}

function RequestTable({
  requests,
  isPending,
  onAct,
}: {
  requests: CategoryRequestRow[]
  isPending: boolean
  onAct: (id: string, status: 'approved' | 'rejected') => void
}) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {['Business', 'Requested label', 'Submitted', 'Status', ''].map((h) => (
              <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {requests.map((req) => (
            <tr key={req.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                {req.vendors ? (
                  <Link
                    href={`/operations/vendors/${req.vendor_id}`}
                    className="flex items-center gap-1 font-medium text-gray-900 hover:underline"
                  >
                    {req.vendors.business_name}
                    <ExternalLink className="w-3 h-3 text-gray-400" />
                  </Link>
                ) : (
                  <span className="text-gray-400 italic">Unknown</span>
                )}
                {req.vendors?.vendor_code && (
                  <span className="text-xs text-gray-400 font-mono">{req.vendors.vendor_code}</span>
                )}
              </td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#F0DFF6] text-[#7E5896] rounded-full text-xs font-semibold">
                  <Tag className="w-3 h-3" />
                  {req.requested_label}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-500 text-xs">
                {new Date(req.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
              </td>
              <td className="px-4 py-3">
                <span className={cn(
                  'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize',
                  STATUS_STYLES[req.status] ?? STATUS_STYLES.pending,
                )}>
                  {req.status}
                </span>
              </td>
              <td className="px-4 py-3">
                {req.status === 'pending' && (
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={() => onAct(req.id, 'approved')}
                      disabled={isPending}
                      title="Approve — add to Vendor Categories CMS"
                      className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold hover:bg-emerald-100 disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => onAct(req.id, 'rejected')}
                      disabled={isPending}
                      title="Reject"
                      className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 text-gray-600 border border-gray-200 rounded-lg text-xs font-semibold hover:bg-gray-100 disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
