'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, Check, Pencil, Plus, Tag, X } from 'lucide-react'
import { useOnboardingDraft } from '@/lib/onboarding/draft'
import { CANCELLATION_OPTIONS, RESCHEDULE_OPTIONS } from '@/lib/onboarding/policies'
import { LIPA_NAMBA_NETWORKS, PAYOUT_OPTIONS } from '@/lib/onboarding/payouts'
import {
  type PackageBadge,
  type PackageBadgeIcon,
  type PackageBadgeTone,
  type PackageDraft,
} from '@/lib/onboarding/packages'
import {
  PACKAGE_BADGE_ICONS,
  PACKAGE_BADGE_TONES,
  packageBadgeIcon,
  packageBadgeToneClass,
} from '@/lib/storefront/package-badge'
import { getStorefrontSections } from '@/lib/storefront/completion'
import { cn } from '@/lib/utils'

function formatTZS(raw: string) {
  if (!raw) return ''
  const digits = raw.replace(/\D/g, '')
  if (!digits) return ''
  return new Intl.NumberFormat('en-TZ').format(Number(digits))
}

const DEFAULT_BADGE: PackageBadge = {
  label: 'Popular',
  icon: 'star',
  tone: 'dark',
}

export default function PackagesPage() {
  const router = useRouter()
  const { draft, update, hydrated } = useOnboardingDraft()
  const [editingBadgeId, setEditingBadgeId] = useState<string | null>(null)

  const nextHref = useMemo(() => {
    const sections = getStorefrontSections(draft)
    const idx = sections.findIndex((s) => s.id === 'packages')
    return idx >= 0 && idx < sections.length - 1 ? sections[idx + 1].href : null
  }, [draft])

  if (!hydrated) return <div className="p-8" aria-hidden />

  const startingPrice =
    draft.startingPrice ||
    (draft.packages.length > 0
      ? formatTZS(
          String(
            Math.min(
              ...draft.packages
                .map((p) => Number(p.price.replace(/[^\d]/g, '')))
                .filter((n) => Number.isFinite(n) && n > 0),
            ),
          ),
        )
      : '')

  const cancellationLabel = CANCELLATION_OPTIONS.find(
    (o) => o.id === draft.cancellationLevel,
  )?.label
  const rescheduleLabel = RESCHEDULE_OPTIONS.find(
    (o) => o.id === draft.reschedulePolicy,
  )?.label
  const payoutLabel = PAYOUT_OPTIONS.find((o) => o.id === draft.payoutMethod)?.label
  const lipaNetworkLabel = LIPA_NAMBA_NETWORKS.find(
    (n) => n.id === draft.payoutNetwork,
  )?.label

  const updatePackageBadge = (id: string, badge: PackageBadge | undefined) => {
    update({
      packages: draft.packages.map((p) => (p.id === id ? { ...p, badge } : p)),
    })
  }

  const onNext = () => {
    if (nextHref) router.push(nextHref)
  }

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex-1 px-6 lg:px-10 pt-4 lg:pt-5 pb-6">
        <div className="max-w-4xl space-y-6">
          {/* Packages */}
          <Card
            title="Packages"
            right={
              <div className="flex items-center gap-4">
                {startingPrice ? (
                  <span className="text-sm text-gray-600">
                    Starting from{' '}
                    <span className="text-gray-900 font-semibold tabular-nums">
                      TSh {startingPrice}
                    </span>
                  </span>
                ) : null}
                <EditLink href="/onboard/pricing" />
              </div>
            }
          >
            <p className="text-xs text-gray-500 mb-5">
              Click the pill on any card to set your own label, icon, and colour — e.g.{' '}
              <span className="font-medium text-gray-700">Platinum</span>,{' '}
              <span className="font-medium text-gray-700">Best Value</span>,{' '}
              <span className="font-medium text-gray-700">Most Booked</span>.
            </p>
            {draft.packages.length === 0 ? (
              <p className="text-sm text-gray-500 py-2">No packages yet.</p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {draft.packages.map((pkg) => (
                  <PackageCard
                    key={pkg.id}
                    pkg={pkg}
                    editing={editingBadgeId === pkg.id}
                    onOpenEditor={() => setEditingBadgeId(pkg.id)}
                    onCloseEditor={() => setEditingBadgeId(null)}
                    onSaveBadge={(badge) => updatePackageBadge(pkg.id, badge)}
                  />
                ))}
              </div>
            )}
            {draft.customQuotes ? (
              <p className="mt-4 text-xs text-gray-500 italic">
                Custom quotes available on request.
              </p>
            ) : null}
          </Card>

          {/* Booking policies */}
          <Card title="Booking policies" right={<EditLink href="/onboard/pricing/policies" />}>
            <dl className="divide-y divide-gray-100">
              <Row label="Deposit">
                {draft.depositPercent ? `${draft.depositPercent}% to confirm` : '—'}
              </Row>
              <Row label="Cancellation">{cancellationLabel ?? '—'}</Row>
              <Row label="Reschedule">{rescheduleLabel ?? '—'}</Row>
            </dl>
          </Card>

          {/* Payout */}
          <Card title="Payout" right={<EditLink href="/onboard/pricing/payout" />}>
            <dl className="divide-y divide-gray-100">
              <Row label="Method">{payoutLabel ?? '—'}</Row>
              {draft.payoutMethod === 'bank' ? (
                <Row label="Bank">{draft.payoutBankName || '—'}</Row>
              ) : null}
              {draft.payoutMethod === 'lipa-namba' ? (
                <Row label="Network">{lipaNetworkLabel ?? '—'}</Row>
              ) : null}
              <Row
                label={
                  draft.payoutMethod === 'bank'
                    ? 'Account number'
                    : draft.payoutMethod === 'lipa-namba'
                      ? 'Lipa Namba'
                      : 'Number'
                }
              >
                {draft.payoutNumber
                  ? draft.payoutMethod === 'bank' || draft.payoutMethod === 'lipa-namba'
                    ? draft.payoutNumber
                    : `+255 ${draft.payoutNumber}`
                  : '—'}
              </Row>
              <Row label="Account holder">{draft.payoutAccountName || '—'}</Row>
            </dl>
          </Card>
        </div>
      </div>

      <div className="sticky bottom-0 border-t border-gray-100 bg-white/95 backdrop-blur z-30">
        <div className="px-6 lg:px-10 py-3 flex items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            <span className="font-semibold text-gray-900 tabular-nums">
              {draft.packages.length}
            </span>{' '}
            package{draft.packages.length === 1 ? '' : 's'} ·{' '}
            <span className="font-semibold text-gray-900 tabular-nums">
              {draft.packages.filter((p) => p.badge).length}
            </span>{' '}
            with custom badges
          </p>
          <button
            type="button"
            onClick={onNext}
            className="inline-flex items-center gap-2 bg-gray-900 text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-gray-800 transition-colors"
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function PackageCard({
  pkg,
  editing,
  onOpenEditor,
  onCloseEditor,
  onSaveBadge,
}: {
  pkg: PackageDraft
  editing: boolean
  onOpenEditor: () => void
  onCloseEditor: () => void
  onSaveBadge: (badge: PackageBadge | undefined) => void
}) {
  const Icon = pkg.badge ? packageBadgeIcon(pkg.badge.icon) : null
  const includes = pkg.includes.filter(Boolean)
  const isEmphasised = Boolean(pkg.badge)

  return (
    <div
      className={cn(
        'relative bg-white rounded-xl border p-4 transition-shadow',
        isEmphasised
          ? 'border-2 border-gray-900 shadow-[0_4px_18px_-8px_rgba(0,0,0,0.18)]'
          : 'border border-gray-200',
      )}
    >
      {/* Badge slot — always present so vendors discover it. Empty state shows
          a faint "Add badge" affordance; populated shows their custom pill. */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
        {pkg.badge && Icon ? (
          <button
            type="button"
            onClick={onOpenEditor}
            className={cn(
              'inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full whitespace-nowrap shadow-sm hover:opacity-90 transition-opacity',
              packageBadgeToneClass(pkg.badge.tone),
            )}
            title="Edit badge"
          >
            <Icon className="w-2.5 h-2.5" />
            {pkg.badge.label}
            <Pencil className="w-2.5 h-2.5 opacity-60 ml-0.5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onOpenEditor}
            className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full whitespace-nowrap bg-white border border-dashed border-gray-300 text-gray-500 hover:border-gray-500 hover:text-gray-900 transition-colors"
            title="Add a badge"
          >
            <Plus className="w-2.5 h-2.5" />
            Add badge
          </button>
        )}
      </div>

      <p className="text-sm font-semibold text-gray-900 mt-2">{pkg.name || 'Untitled package'}</p>
      <p className="text-lg font-semibold text-gray-900 tabular-nums tracking-tight mt-1">
        {pkg.price ? `TSh ${pkg.price}` : '—'}
      </p>
      {pkg.description ? <p className="text-xs text-gray-500 mt-1">{pkg.description}</p> : null}
      {includes.length > 0 ? (
        <ul className="mt-3 space-y-1.5 text-xs text-gray-700">
          {includes.map((item, idx) => (
            <li key={idx} className="flex items-start gap-1.5">
              <Check className="w-3 h-3 text-emerald-600 mt-0.5 shrink-0" strokeWidth={3} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {editing ? (
        <BadgeEditor
          initial={pkg.badge ?? DEFAULT_BADGE}
          hadBadge={Boolean(pkg.badge)}
          onClose={onCloseEditor}
          onSave={(badge) => {
            onSaveBadge(badge)
            onCloseEditor()
          }}
          onRemove={() => {
            onSaveBadge(undefined)
            onCloseEditor()
          }}
        />
      ) : null}
    </div>
  )
}

function BadgeEditor({
  initial,
  hadBadge,
  onClose,
  onSave,
  onRemove,
}: {
  initial: PackageBadge
  hadBadge: boolean
  onClose: () => void
  onSave: (badge: PackageBadge) => void
  onRemove: () => void
}) {
  const [label, setLabel] = useState(initial.label)
  const [icon, setIcon] = useState<PackageBadgeIcon>(initial.icon)
  const [tone, setTone] = useState<PackageBadgeTone>(initial.tone)
  const editorRef = useRef<HTMLDivElement>(null)

  // Close on outside click — keeps the inline editor feeling like a popover
  // without pulling in a real popover dependency.
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (editorRef.current && !editorRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const PreviewIcon = packageBadgeIcon(icon)
  const trimmed = label.trim()

  return (
    <div
      ref={editorRef}
      className="absolute inset-x-0 top-full mt-2 z-30 bg-white rounded-xl border border-gray-200 shadow-[0_8px_28px_-12px_rgba(0,0,0,0.25)] p-4 w-full"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Customise badge</p>
        <button
          type="button"
          onClick={onClose}
          className="p-1 -mr-1 -mt-1 text-gray-400 hover:text-gray-700 rounded-md transition-colors"
          aria-label="Close"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Label input */}
      <label className="block text-[11px] font-semibold text-gray-700 mb-1">Label</label>
      <input
        type="text"
        value={label}
        onChange={(e) => setLabel(e.target.value.slice(0, 24))}
        placeholder="e.g. Platinum, Best Value"
        maxLength={24}
        className="w-full bg-white rounded-md border border-gray-300 px-2.5 py-1.5 text-sm text-gray-900 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none mb-3"
      />

      {/* Icon picker */}
      <p className="text-[11px] font-semibold text-gray-700 mb-1.5">Icon</p>
      <div className="grid grid-cols-5 gap-1.5 mb-3">
        {PACKAGE_BADGE_ICONS.map(({ id, label: iconLabel, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setIcon(id)}
            title={iconLabel}
            aria-label={iconLabel}
            aria-pressed={icon === id}
            className={cn(
              'aspect-square rounded-md border flex items-center justify-center transition-colors',
              icon === id
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400',
            )}
          >
            <Icon className="w-3.5 h-3.5" />
          </button>
        ))}
      </div>

      {/* Tone picker */}
      <p className="text-[11px] font-semibold text-gray-700 mb-1.5">Colour</p>
      <div className="grid grid-cols-5 gap-1.5 mb-4">
        {PACKAGE_BADGE_TONES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTone(t.id)}
            title={t.label}
            aria-label={t.label}
            aria-pressed={tone === t.id}
            className={cn(
              'aspect-square rounded-md flex items-center justify-center transition-shadow',
              tone === t.id
                ? 'ring-2 ring-offset-2 ring-gray-900'
                : 'ring-1 ring-inset ring-gray-200 hover:ring-gray-400',
            )}
          >
            <span className={cn('w-4 h-4 rounded-sm', t.swatchClassName)} />
          </button>
        ))}
      </div>

      {/* Live preview */}
      <div className="rounded-lg bg-gray-50 px-3 py-3 mb-3 flex items-center justify-center">
        <span
          className={cn(
            'inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full whitespace-nowrap shadow-sm',
            packageBadgeToneClass(tone),
          )}
        >
          <PreviewIcon className="w-2.5 h-2.5" />
          {trimmed || 'Preview'}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-2">
        {hadBadge ? (
          <button
            type="button"
            onClick={onRemove}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700"
          >
            Remove badge
          </button>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-md"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!trimmed}
            onClick={() => onSave({ label: trimmed, icon, tone })}
            className="inline-flex items-center gap-1 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs font-semibold px-3 py-1.5 rounded-md transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

function Card({
  title,
  right,
  children,
}: {
  title: string
  right?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-6 lg:p-7">
      <div className="flex items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center">
            <Tag className="w-4 h-4" />
          </span>
          <h2 className="text-base font-semibold text-gray-900 tracking-tight">{title}</h2>
        </div>
        {right}
      </div>
      {children}
    </section>
  )
}

function EditLink({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
    >
      <Pencil className="w-3.5 h-3.5" />
      Edit
    </Link>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-1 sm:gap-6 py-3 items-center">
      <dt className="text-sm text-gray-500">{label}</dt>
      <dd className="text-sm text-gray-900">{children}</dd>
    </div>
  )
}
