'use client'

import Link from 'next/link'
import {
  ArrowUpRight,
  Check,
  Clock,
  FileWarning,
  Pencil,
  Pause,
  ShieldAlert,
  Sparkles,
  UserRound,
  XCircle,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { VendorAvatar } from './VendorAvatar'
import { StatusPill, type StatusPillVariant } from './StatusPill'
import type { VendorAccount } from '../_lib/types'

const STATUS_BADGE: Record<
  VendorAccount['status'],
  { label: string; variant: StatusPillVariant }
> = {
  awaiting_review: { label: 'SUBMITTED', variant: 'warning' },
  needs_corrections: { label: 'CORRECTIONS', variant: 'danger' },
  uploading_docs: { label: 'UPLOADING', variant: 'info' },
  drafting: { label: 'DRAFTING', variant: 'neutral' },
  active: { label: 'ACTIVE', variant: 'success' },
  suspended: { label: 'SUSPENDED', variant: 'neutral' },
}

export function VendorRowCard({
  vendor,
  slaHours,
}: {
  vendor: VendorAccount
  slaHours: number
}) {
  const href = `/operations/vendors/${vendor.id}`
  const statusBadge = STATUS_BADGE[vendor.status]

  return (
    <Link
      href={href}
      className="group block bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-[border-color,box-shadow] rounded-xl p-4"
    >
      <div className="flex items-start gap-4 flex-wrap sm:flex-nowrap">
        <VendorAvatar
          logoUrl={vendor.logoUrl}
          businessName={vendor.businessName}
        />

        {/* Body — name, meta, pills */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-[15px] font-semibold text-gray-900 truncate">
              {vendor.businessName}
            </h3>
            <span className="text-xs font-mono text-gray-400 tracking-tight">
              {vendor.publicId}
            </span>
            <span className="ml-auto sm:ml-2">
              <StatusPill variant={statusBadge.variant}>
                {statusBadge.label}
              </StatusPill>
            </span>
          </div>

          <p className="mt-1 text-[13px] text-gray-500 truncate">
            {[
              titleCaseCategory(vendor.category),
              vendor.city,
              vendor.submittedByName
                ? `submitted by ${vendor.submittedByName}`
                : null,
            ]
              .filter(Boolean)
              .join(' · ') || '—'}
          </p>

          <div className="mt-2.5 flex flex-wrap gap-1.5">
            <RowPills vendor={vendor} />
          </div>
        </div>

        {/* Right rail — submitted age + Review CTA */}
        <div className="flex flex-col items-end gap-2.5 shrink-0 w-full sm:w-auto sm:min-w-[140px]">
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              {vendor.status === 'awaiting_review' ? 'Submitted' : 'Created'}
            </p>
            <p
              className={
                'text-[13px] font-medium tabular-nums ' +
                ageTone(vendor, slaHours)
              }
            >
              {formatRelativeTime(vendor.submittedAt ?? vendor.createdAt)}
            </p>
          </div>
          <span className="inline-flex items-center gap-1 bg-[#2D6A4F] hover:bg-[#22543D] text-white text-[13px] font-medium px-3.5 py-1.5 rounded-md transition-colors">
            Review
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}

// --- Pill matrix per spec §8 ----------------------------------------------

function RowPills({ vendor }: { vendor: VendorAccount }) {
  switch (vendor.status) {
    case 'awaiting_review':
      return <AwaitingReviewPills vendor={vendor} />
    case 'needs_corrections':
      return (
        <StatusPill variant="danger" icon={<XCircle className="w-3 h-3" />}>
          Needs corrections
        </StatusPill>
      )
    case 'uploading_docs':
      return (
        <StatusPill variant="info" icon={<Clock className="w-3 h-3" />}>
          {vendor.documentsTotal === 0
            ? 'Awaiting documents'
            : `${vendor.documentsVerified}/${vendor.documentsTotal} verified`}
        </StatusPill>
      )
    case 'drafting':
      return (
        <StatusPill variant="neutral" icon={<Pencil className="w-3 h-3" />}>
          Drafting
        </StatusPill>
      )
    case 'active':
      return (
        <StatusPill variant="success" icon={<Sparkles className="w-3 h-3" />}>
          Live on OpusFesta
        </StatusPill>
      )
    case 'suspended':
      return (
        <StatusPill variant="neutral" icon={<Pause className="w-3 h-3" />}>
          Suspended
        </StatusPill>
      )
    default:
      return null
  }
}

function AwaitingReviewPills({ vendor }: { vendor: VendorAccount }) {
  const pills: ReactNode[] = []

  pills.push(
    vendor.agreementStatus === 'signed' ? (
      <StatusPill
        key="agreement"
        variant="success"
        icon={<Check className="w-3 h-3" strokeWidth={3} />}
      >
        Signed
      </StatusPill>
    ) : (
      <StatusPill
        key="agreement"
        variant="warning"
        icon={<ShieldAlert className="w-3 h-3" />}
      >
        Agreement pending
      </StatusPill>
    ),
  )

  if (vendor.documentsTotal > 0) {
    const allVerified = vendor.documentsVerified === vendor.documentsTotal
    pills.push(
      <StatusPill
        key="docs"
        variant={allVerified ? 'success' : 'warning'}
        icon={
          allVerified ? (
            <Check className="w-3 h-3" strokeWidth={3} />
          ) : (
            <FileWarning className="w-3 h-3" />
          )
        }
      >
        {vendor.documentsVerified}/{vendor.documentsTotal} docs
        {allVerified ? ' verified' : ''}
      </StatusPill>,
    )
  } else {
    pills.push(
      <StatusPill
        key="docs"
        variant="warning"
        icon={<FileWarning className="w-3 h-3" />}
      >
        No docs uploaded
      </StatusPill>,
    )
  }

  pills.push(
    vendor.reviewerId ? (
      <StatusPill
        key="reviewer"
        variant="info"
        icon={<UserRound className="w-3 h-3" />}
      >
        Assigned
      </StatusPill>
    ) : (
      <StatusPill
        key="reviewer"
        variant="warning"
        icon={<Clock className="w-3 h-3" />}
      >
        Unassigned
      </StatusPill>
    ),
  )

  return <>{pills}</>
}

// --- Time helpers ----------------------------------------------------------

function ageTone(vendor: VendorAccount, slaHours: number): string {
  if (vendor.status !== 'awaiting_review' || !vendor.submittedAt) {
    return 'text-gray-700'
  }
  const ageMs = Date.now() - new Date(vendor.submittedAt).getTime()
  const slaMs = slaHours * 60 * 60 * 1000
  if (ageMs > slaMs * 2) return 'text-rose-700'
  if (ageMs > slaMs) return 'text-amber-700'
  return 'text-gray-700'
}

function formatRelativeTime(iso: string | null): string {
  if (!iso) return '—'
  const target = new Date(iso).getTime()
  if (Number.isNaN(target)) return '—'
  const diffMs = Date.now() - target
  if (diffMs < 60_000) return 'just now'
  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 60) return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} ${days === 1 ? 'day' : 'days'} ago`
  const weeks = Math.floor(days / 7)
  if (weeks < 5) return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function titleCaseCategory(raw: string): string {
  if (!raw) return ''
  return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase()
}
