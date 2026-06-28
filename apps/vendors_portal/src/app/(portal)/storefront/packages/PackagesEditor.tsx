'use client'

import { useEffect, useMemo, useRef, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, Check, Lock, Pencil, Plus, Save, Tag, X } from 'lucide-react'
import { getStorefrontSections } from '@/lib/storefront/completion'
import {
  hasCompletePayout,
  newPayoutEntryId,
  primaryPayoutEntry,
  useOnboardingDraft,
  type CancellationLevel,
  type OnboardingDraft,
  type PayoutMethod,
  type ReschedulePolicy,
} from '@/lib/onboarding/draft'
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
import { cn } from '@/lib/utils'
import { saveBadge } from './actions'
import { saveProfileFields } from '../sections/actions'

export type InitialPolicies = {
  depositPercent: string
  cancellationLevel: CancellationLevel
  reschedulePolicy: ReschedulePolicy
}

export type PayoutSummary = {
  methodType: string
  provider: string | null
  accountNumber: string
  accountHolder: string
  count: number
} | null

// DB `method_type` enum → human label. Mirrors PAYOUT_OPTIONS but keyed by the
// stored enum value (halopesa collapses into lipa_namba at write time).
const PAYOUT_DB_LABEL: Record<string, string> = {
  mpesa: 'M-Pesa',
  airtel: 'Airtel Money',
  tigo: 'Mixx by Yas',
  lipa_namba: 'Lipa Namba',
  bank: 'Bank account',
}

// DB `method_type` enum → the draft's PayoutMethod tag, so the on-file payout
// can be mirrored back into the draft for the completion sidebar.
const DB_METHOD_TO_DRAFT: Record<string, PayoutMethod> = {
  mpesa: 'mpesa',
  airtel: 'airtel-money',
  tigo: 'tigopesa',
  lipa_namba: 'lipa-namba',
  bank: 'bank',
}

export type PackagesSource =
  | { kind: 'live' }
  | { kind: 'no-application' }
  | { kind: 'pending-approval' }
  | { kind: 'suspended' }
  | { kind: 'no-env' }

const BANNER_BY_SOURCE: Record<PackagesSource['kind'], string | null> = {
  live: null,
  'no-application':
    "You haven't started a vendor application yet. Apply to do business on OpusFesta to edit your packages.",
  'pending-approval':
    'Your vendor application is awaiting OpusFesta verification. Editing unlocks once your account is approved.',
  suspended:
    'Your vendor account is suspended. Contact OpusFesta support if you believe this is a mistake.',
  'no-env':
    'DEV: Vendor backend not connected — Save is disabled. Check Supabase env vars and that migrations are applied to your Supabase project.',
}

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

type PackagesEditorProps = {
  source: PackagesSource
  initialPackages: PackageDraft[]
  initialPolicies: InitialPolicies
  initialPayout: PayoutSummary
  canEdit: boolean
}

export default function PackagesEditor({
  source,
  initialPackages,
  initialPolicies,
  initialPayout,
  canEdit,
}: PackagesEditorProps) {
  // Packages come from vendors.packages (Server Component). Booking policies
  // (deposit / cancellation / reschedule) have their own vendors columns and
  // are saved from this page. Payout lives in the secure vendor_payout_methods
  // table, edited via the onboarding payout step — shown here read-only.
  const router = useRouter()
  const { draft, update, hydrated } = useOnboardingDraft()
  const [packages, setPackages] = useState<PackageDraft[]>(initialPackages)
  const [editingBadgeId, setEditingBadgeId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<
    { kind: 'success' | 'error'; message: string } | null
  >(null)
  const [, startTransition] = useTransition()
  const [saving, startSaving] = useTransition()
  const [saveMsg, setSaveMsg] = useState<{ kind: 'success' | 'error'; text: string } | null>(null)

  // Sync local state when the Server Component re-renders with fresh data
  // (e.g. after revalidatePath fires post-save, or another tab made a change
  // and the page revalidates). Without this, useState would hold the
  // initial-mount value forever and the UI would drift from DB.
  useEffect(() => {
    setPackages(initialPackages)
  }, [initialPackages])

  // Seed the local draft's booking policies from the DB once on mount, so a
  // fresh device or cleared storage shows this vendor's saved values instead of
  // blanks. The draft is now scoped to the ACTIVE vendor, so the DB row is the
  // source of truth for THIS business and seeding from it can never surface
  // another business's policies. We treat "no policy chosen yet" off the two
  // nullable fields (depositPercent carries a non-empty default, so it can't
  // stand in for "unset") — that way we prefer the DB on first view but don't
  // clobber a cancellation/reschedule the vendor just picked on the policies
  // step before saving here.
  const policiesSeeded = useRef(false)
  useEffect(() => {
    if (!hydrated || policiesSeeded.current) return
    policiesSeeded.current = true
    const draftHasPolicy =
      draft.cancellationLevel !== null || draft.reschedulePolicy !== null
    const dbHasPolicy = Boolean(
      initialPolicies.depositPercent ||
        initialPolicies.cancellationLevel ||
        initialPolicies.reschedulePolicy,
    )
    if (!draftHasPolicy && dbHasPolicy) {
      update({
        depositPercent: initialPolicies.depositPercent || draft.depositPercent,
        cancellationLevel: initialPolicies.cancellationLevel,
        reschedulePolicy: initialPolicies.reschedulePolicy,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated])

  // Mirror the saved packages + the on-file payout into the draft so the
  // storefront completion sidebar (which reads draft.packages /
  // draft.payoutMethods) marks the Packages section complete on any device —
  // not just the one where the vendor onboarded. Booking policies are seeded
  // above; without this the section stays stuck on "Required" despite the DB
  // holding packages, policies, and a payout method.
  useEffect(() => {
    if (!hydrated) return
    const patch: Partial<OnboardingDraft> = {}
    if (JSON.stringify(draft.packages) !== JSON.stringify(packages)) {
      patch.packages = packages
    }
    if (initialPayout && !hasCompletePayout(draft)) {
      const method = DB_METHOD_TO_DRAFT[initialPayout.methodType]
      if (
        method &&
        initialPayout.accountNumber.trim() &&
        initialPayout.accountHolder.trim()
      ) {
        patch.payoutMethods = [
          {
            id: newPayoutEntryId(),
            method,
            number: initialPayout.accountNumber,
            accountName: initialPayout.accountHolder,
            bankName: method === 'bank' ? initialPayout.provider ?? '' : '',
            network: method === 'lipa-namba' ? initialPayout.provider ?? '' : '',
            primary: true,
          },
        ]
      }
    }
    if (Object.keys(patch).length > 0) update(patch)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, packages, initialPayout])

  const onSavePolicies = () => {
    if (!canEdit) return
    setSaveMsg(null)
    startSaving(async () => {
      const res = await saveProfileFields({
        depositPercent: draft.depositPercent,
        cancellationLevel: draft.cancellationLevel,
        reschedulePolicy: draft.reschedulePolicy,
      })
      if (res.ok) setSaveMsg({ kind: 'success', text: 'Booking policies saved.' })
      else setSaveMsg({ kind: 'error', text: res.error })
    })
  }

  const banner = BANNER_BY_SOURCE[source.kind]

  const nextHref = useMemo(() => {
    const sections = getStorefrontSections(draft)
    const idx = sections.findIndex((s) => s.id === 'packages')
    return idx >= 0 && idx < sections.length - 1 ? sections[idx + 1].href : null
  }, [draft])

  const onNext = () => {
    if (nextHref) router.push(nextHref)
  }

  const validPrices = packages
    .map((p) => Number(p.price.replace(/[^\d]/g, '')))
    .filter((n) => Number.isFinite(n) && n > 0)
  const startingPrice =
    validPrices.length > 0
      ? formatTZS(String(Math.min(...validPrices)))
      : ''

  const cancellationLabel = CANCELLATION_OPTIONS.find(
    (o) => o.id === draft.cancellationLevel,
  )?.label
  const rescheduleLabel = RESCHEDULE_OPTIONS.find(
    (o) => o.id === draft.reschedulePolicy,
  )?.label

  // Payout: prefer the value actually on file in the DB; fall back to the local
  // draft (e.g. mid-onboarding before the first submit writes the payout table).
  const draftPrimary = primaryPayoutEntry(draft)
  const payoutView = useMemo(() => {
    if (initialPayout) {
      const isBank = initialPayout.methodType === 'bank'
      const isLipa = initialPayout.methodType === 'lipa_namba'
      return {
        methodLabel: PAYOUT_DB_LABEL[initialPayout.methodType] ?? initialPayout.methodType,
        isBank,
        isLipa,
        provider: isLipa
          ? LIPA_NAMBA_NETWORKS.find((n) => n.id === initialPayout.provider)?.label ??
            initialPayout.provider
          : initialPayout.provider,
        number: initialPayout.accountNumber,
        accountHolder: initialPayout.accountHolder,
        count: initialPayout.count,
      }
    }
    if (hydrated && draftPrimary?.method) {
      return {
        methodLabel:
          PAYOUT_OPTIONS.find((o) => o.id === draftPrimary.method)?.label ?? draftPrimary.method,
        isBank: draftPrimary.method === 'bank',
        isLipa: draftPrimary.method === 'lipa-namba',
        provider:
          draftPrimary.method === 'lipa-namba'
            ? LIPA_NAMBA_NETWORKS.find((n) => n.id === draftPrimary.network)?.label ??
              draftPrimary.network
            : draftPrimary.bankName,
        number: draftPrimary.number,
        accountHolder: draftPrimary.accountName,
        count: draft.payoutMethods.length,
      }
    }
    return null
  }, [initialPayout, hydrated, draftPrimary, draft.payoutMethods.length])

  const persistBadge = (
    pkg: PackageDraft,
    next: PackageBadge | undefined,
  ) => {
    if (!canEdit) return
    const previous = packages
    setPackages((prev) =>
      prev.map((p) => (p.id === pkg.id ? { ...p, badge: next } : p)),
    )
    setFeedback(null)
    startTransition(async () => {
      const result = await saveBadge({
        packageId: pkg.id,
        badge: next ?? null,
      })
      if (result.ok) {
        setFeedback({ kind: 'success', message: 'Badge saved.' })
      } else {
        // Roll back the optimistic update so the UI reflects DB state.
        setPackages(previous)
        setFeedback({ kind: 'error', message: result.error })
        // On a stale-state failure (vendor row vanished, package id no
        // longer present in the DB), re-fetch from the server so the rolled-
        // back UI matches reality. Without router.refresh() the user would
        // see the same stale package list and any retry would fail again.
        if (result.reason === 'stale') {
          router.refresh()
        }
      }
    })
  }

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex-1 px-6 lg:px-10 pt-4 lg:pt-5 pb-6">
        <div className="max-w-4xl space-y-6">
          {banner && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-800">
              {banner}
            </div>
          )}

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
              {canEdit
                ? 'Click the pill on any card to set your own label, icon, and colour — e.g.'
                : 'Read-only — owner or manager role can edit. Examples:'}{' '}
              <span className="font-medium text-gray-700">Platinum</span>,{' '}
              <span className="font-medium text-gray-700">Best Value</span>,{' '}
              <span className="font-medium text-gray-700">Most Booked</span>.
            </p>
            {packages.length === 0 ? (
              <p className="text-sm text-gray-500 py-2">
                No packages yet. Add them on the{' '}
                <Link href="/onboard/pricing" className="underline">
                  pricing page
                </Link>
                .
              </p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {packages.map((pkg) => (
                  <PackageCard
                    key={pkg.id}
                    pkg={pkg}
                    canEdit={canEdit}
                    editing={editingBadgeId === pkg.id}
                    onOpenEditor={() => canEdit && setEditingBadgeId(pkg.id)}
                    onCloseEditor={() => setEditingBadgeId(null)}
                    onSaveBadge={(badge) => persistBadge(pkg, badge)}
                  />
                ))}
              </div>
            )}
            {feedback ? (
              <p
                className={cn(
                  'mt-3 text-xs font-semibold',
                  feedback.kind === 'success'
                    ? 'text-emerald-700'
                    : 'text-rose-700',
                )}
                role="status"
              >
                {feedback.message}
              </p>
            ) : null}
          </Card>

          {/* Booking policies — saved to vendors.{deposit_percent,cancellation_level,reschedule_policy} via the Save bar below */}
          <Card
            title="Booking policies"
            right={<EditLink href="/onboard/pricing/policies" />}
          >
            <dl className="divide-y divide-gray-100">
              <Row label="Deposit">
                {hydrated && draft.depositPercent
                  ? `${draft.depositPercent}% to confirm`
                  : '—'}
              </Row>
              <Row label="Cancellation">{(hydrated && cancellationLabel) || '—'}</Row>
              <Row label="Reschedule">{(hydrated && rescheduleLabel) || '—'}</Row>
            </dl>
          </Card>

          {/* Payout — read-only summary of the secure vendor_payout_methods table */}
          <Card
            title="Payout"
            icon={Lock}
            hint="Saved securely from your onboarding payout step. Use Edit to change your bank or mobile-money details."
            right={<EditLink href="/onboard/pricing/payout" />}
          >
            {payoutView ? (
              <dl className="divide-y divide-gray-100">
                <Row label={payoutView.count > 1 ? 'Primary method' : 'Method'}>
                  {payoutView.methodLabel}
                </Row>
                {payoutView.isBank && payoutView.provider ? (
                  <Row label="Bank">{payoutView.provider}</Row>
                ) : null}
                {payoutView.isLipa && payoutView.provider ? (
                  <Row label="Network">{payoutView.provider}</Row>
                ) : null}
                <Row
                  label={
                    payoutView.isBank
                      ? 'Account number'
                      : payoutView.isLipa
                        ? 'Lipa Namba'
                        : 'Number'
                  }
                >
                  {payoutView.number
                    ? payoutView.isBank || payoutView.isLipa
                      ? payoutView.number
                      : `+255 ${payoutView.number}`
                    : '—'}
                </Row>
                <Row label="Account holder">{payoutView.accountHolder || '—'}</Row>
                {payoutView.count > 1 ? (
                  <Row label="Other methods">{payoutView.count - 1} more on file</Row>
                ) : null}
              </dl>
            ) : (
              <p className="text-sm text-gray-500 py-2">
                No payout method on file yet. Add one on the{' '}
                <Link href="/onboard/pricing/payout" className="underline">
                  payout step
                </Link>
                .
              </p>
            )}
          </Card>
        </div>
      </div>

      <div className="sticky bottom-0 border-t border-gray-100 bg-white/95 backdrop-blur z-30">
        <div className="px-6 lg:px-10 py-3 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-xs text-gray-500 flex items-center gap-x-3 gap-y-1 flex-wrap">
            <span>
              <span className="font-semibold text-gray-900 tabular-nums">
                {packages.length}
              </span>{' '}
              package{packages.length === 1 ? '' : 's'} ·{' '}
              <span className="font-semibold text-gray-900 tabular-nums">
                {packages.filter((p) => p.badge).length}
              </span>{' '}
              with custom badges
            </span>
            {saveMsg ? (
              <span
                className={cn(
                  'inline-flex items-center gap-1 font-semibold',
                  saveMsg.kind === 'success' ? 'text-emerald-700' : 'text-rose-700',
                )}
                role="status"
              >
                {saveMsg.kind === 'success' && <Check className="w-3.5 h-3.5" />}
                {saveMsg.text}
              </span>
            ) : null}
          </p>
          <div className="flex items-center gap-2">
            {canEdit ? (
              <button
                type="button"
                onClick={onSavePolicies}
                disabled={saving || !hydrated}
                className="inline-flex items-center gap-2 bg-white border border-gray-300 text-gray-900 text-sm font-semibold px-4 py-2 rounded-full hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? 'Saving…' : 'Save'}
              </button>
            ) : null}
            {nextHref ? (
              <button
                type="button"
                onClick={onNext}
                className="inline-flex items-center gap-2 bg-gray-900 text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-gray-800 transition-colors"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

function PackageCard({
  pkg,
  canEdit,
  editing,
  onOpenEditor,
  onCloseEditor,
  onSaveBadge,
}: {
  pkg: PackageDraft
  canEdit: boolean
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
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
        {pkg.badge && Icon ? (
          <button
            type="button"
            onClick={onOpenEditor}
            disabled={!canEdit}
            className={cn(
              'inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full whitespace-nowrap shadow-sm hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70 transition-opacity',
              packageBadgeToneClass(pkg.badge.tone),
            )}
            title={canEdit ? 'Edit badge' : 'Read-only'}
          >
            <Icon className="w-2.5 h-2.5" />
            {pkg.badge.label}
            {canEdit ? <Pencil className="w-2.5 h-2.5 opacity-60 ml-0.5" /> : null}
          </button>
        ) : canEdit ? (
          <button
            type="button"
            onClick={onOpenEditor}
            className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full whitespace-nowrap bg-white border border-dashed border-gray-300 text-gray-500 hover:border-gray-500 hover:text-gray-900 transition-colors"
            title="Add a badge"
          >
            <Plus className="w-2.5 h-2.5" />
            Add badge
          </button>
        ) : null}
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

      <label className="block text-[11px] font-semibold text-gray-700 mb-1">Label</label>
      <input
        type="text"
        value={label}
        onChange={(e) => setLabel(e.target.value.slice(0, 24))}
        placeholder="e.g. Platinum, Best Value"
        maxLength={24}
        className="w-full bg-white rounded-md border border-gray-300 px-2.5 py-1.5 text-sm text-gray-900 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none mb-3"
      />

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
  hint,
  icon: Icon = Tag,
  right,
  children,
}: {
  title: string
  hint?: string
  icon?: typeof Tag
  right?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-6 lg:p-7">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center">
              <Icon className="w-4 h-4" />
            </span>
            <h2 className="text-base font-semibold text-gray-900 tracking-tight">
              {title}
            </h2>
          </div>
          {hint ? (
            <p className="text-[11px] text-gray-500 mt-1.5 ml-9">{hint}</p>
          ) : null}
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
