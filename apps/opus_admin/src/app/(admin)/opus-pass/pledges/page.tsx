import { redirect } from 'next/navigation'
import Link from 'next/link'
import { HandHeart, Users, Wallet } from 'lucide-react'
import { getAdminAccessRole, hasPermission, isAdminDashboardRole } from '@/lib/admin-auth'
import { getEligibleCouples, type EligibleCouple } from './queries'
import PledgesHeading from './PledgesHeading'

export const dynamic = 'force-dynamic'

function formatTzs(value: number): string {
  return `TZS ${value.toLocaleString('en-US')}`
}

function formatDate(iso: string | null): string {
  if (!iso) return 'No date set'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return 'No date set'
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

const TIER_LABEL: Record<EligibleCouple['tier'], string> = {
  elegant: 'Elegant',
  signature: 'Signature',
}

const TIER_CLASS: Record<EligibleCouple['tier'], string> = {
  elegant: 'border-[#C9A0DC] bg-[#F0DFF6] text-[#5d3a78]',
  signature: 'border-amber-200 bg-amber-50 text-amber-800',
}

function CoupleCard({ couple }: { couple: EligibleCouple }) {
  return (
    <Link
      href={`/opus-pass/pledges/${couple.userId}`}
      className="block rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.04)] transition hover:border-[#C9A0DC]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold text-gray-900">{couple.coupleName}</h2>
          <p className="mt-1 text-sm text-gray-500">{formatDate(couple.eventDateLabel)}</p>
        </div>
        <span className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${TIER_CLASS[couple.tier]}`}>
          {TIER_LABEL[couple.tier]}
        </span>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 border-t border-gray-100 pt-4 text-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Pledged</p>
          <p className="mt-1 font-semibold text-gray-900">{formatTzs(couple.totalPledged)}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Received</p>
          <p className="mt-1 font-semibold text-emerald-700">{formatTzs(couple.totalReceived)}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Outstanding</p>
          <p className="mt-1 font-semibold text-amber-700">{couple.outstandingCount} of {couple.pledgeCount}</p>
        </div>
      </div>
    </Link>
  )
}

export default async function PledgeConciergePage() {
  const role = await getAdminAccessRole()
  if (!isAdminDashboardRole(role)) redirect('/contribute')
  if (!(await hasPermission('opuspass.pledges.read'))) redirect('/')

  const couples = await getEligibleCouples()
  const totalPledged = couples.reduce((sum, c) => sum + c.totalPledged, 0)
  const totalReceived = couples.reduce((sum, c) => sum + c.totalReceived, 0)
  const totalOutstanding = couples.reduce((sum, c) => sum + c.outstandingCount, 0)

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <PledgesHeading />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Couples</p>
            <Users className="h-4 w-4 text-[#7E5896]" />
          </div>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-gray-900">{couples.length}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total pledged / received</p>
            <Wallet className="h-4 w-4 text-[#7E5896]" />
          </div>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-gray-900">
            {formatTzs(totalReceived)} <span className="text-base font-normal text-gray-400">/ {formatTzs(totalPledged)}</span>
          </p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Outstanding pledges</p>
            <HandHeart className="h-4 w-4 text-[#7E5896]" />
          </div>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-amber-700">{totalOutstanding}</p>
        </div>
      </div>

      {couples.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center">
          <HandHeart className="mx-auto h-8 w-8 text-gray-300" />
          <h2 className="mt-3 text-sm font-semibold text-gray-900">No eligible couples yet</h2>
          <p className="mt-1 text-sm text-gray-500">
            Couples with a paid Elegant or Signature order will show up here.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {couples.map((couple) => (
            <CoupleCard key={couple.userId} couple={couple} />
          ))}
        </div>
      )}
    </div>
  )
}
