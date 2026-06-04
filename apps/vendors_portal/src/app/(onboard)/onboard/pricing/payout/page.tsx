'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Plus, Star, Trash2 } from 'lucide-react'
import { OnboardShell } from '@/components/onboard/OnboardShell'
import { OnboardHeading } from '@/components/onboard/OnboardHeading'
import { PrimaryButton } from '@/components/onboard/PrimaryButton'
import { WhyWeAsk } from '@/components/onboard/WhyWeAsk'
import { FieldLabel, SelectInput, TextInput } from '@/components/onboard/FormField'
import {
  emptyPayoutEntry,
  isPayoutEntryComplete,
  useOnboardingDraft,
  type PayoutEntry,
} from '@/lib/onboarding/draft'
import { findCategory } from '@/lib/onboarding/categories'
import { LIPA_NAMBA_NETWORKS, PAYOUT_OPTIONS, TZ_BANKS } from '@/lib/onboarding/payouts'

const MAX_PAYOUT_METHODS = 4

export default function PayoutPage() {
  const router = useRouter()
  const { draft, update, hydrated } = useOnboardingDraft()
  const category = findCategory(draft.categoryId)

  useEffect(() => {
    if (!hydrated) return
    if (!draft.categoryId) router.replace('/onboard/category')
    else if (!draft.vowsAccepted) router.replace('/onboard/vows')
    else if (draft.packages.length === 0) router.replace('/onboard/pricing')
    else if (!draft.cancellationLevel) router.replace('/onboard/pricing/policies')
  }, [
    hydrated,
    draft.categoryId,
    draft.vowsAccepted,
    draft.packages.length,
    draft.cancellationLevel,
    router,
  ])

  // Seed a first (primary) entry once hydrated so the vendor always has a card
  // to fill in. Done in an effect to avoid a write during render.
  useEffect(() => {
    if (!hydrated) return
    if (draft.payoutMethods.length === 0) {
      update({ payoutMethods: [emptyPayoutEntry(true)] })
    }
  }, [hydrated, draft.payoutMethods.length, update])

  const entries = draft.payoutMethods

  const setEntries = (next: PayoutEntry[]) => update({ payoutMethods: next })

  const updateEntry = (id: string, patch: Partial<PayoutEntry>) =>
    setEntries(entries.map((e) => (e.id === id ? { ...e, ...patch } : e)))

  const addEntry = () => {
    if (entries.length >= MAX_PAYOUT_METHODS) return
    setEntries([...entries, emptyPayoutEntry(entries.length === 0)])
  }

  const removeEntry = (id: string) => {
    const removed = entries.find((e) => e.id === id)
    let next = entries.filter((e) => e.id !== id)
    // If we removed the primary, promote the first remaining entry.
    if (removed?.primary && next.length > 0 && !next.some((e) => e.primary)) {
      next = next.map((e, i) => ({ ...e, primary: i === 0 }))
    }
    setEntries(next)
  }

  const setPrimary = (id: string) =>
    setEntries(entries.map((e) => ({ ...e, primary: e.id === id })))

  const onMethodChange = (id: string, method: PayoutEntry['method']) => {
    // Clear the sub-fields that don't apply to the newly chosen method so a
    // stale bank/network doesn't get persisted.
    updateEntry(id, {
      method,
      bankName: method === 'bank' ? entries.find((e) => e.id === id)?.bankName ?? '' : '',
      network:
        method === 'lipa-namba' ? entries.find((e) => e.id === id)?.network ?? '' : '',
    })
  }

  const allValid = entries.length > 0 && entries.every(isPayoutEntryComplete)
  const hasPrimary = entries.some((e) => e.primary)
  const canContinue = allValid && hasPrimary

  const onNext = () => {
    if (!canContinue) return
    router.push('/onboard/review')
  }

  return (
    <OnboardShell
      step="pricing"
      profileLabel={category?.profileLabel ?? 'Vendor'}
      backHref="/onboard/pricing/policies"
    >
      <OnboardHeading
        title="Where should we send your payouts?"
        description="OpusFesta releases the deposit when a booking confirms and the balance after the event. Add one or more destinations — mobile money, Lipa Namba, or any TZ bank — and pick which one is primary."
      />

      <div className="space-y-5 max-w-3xl">
        {entries.map((entry, index) => (
          <PayoutEntryCard
            key={entry.id}
            entry={entry}
            index={index}
            canRemove={entries.length > 1}
            onMethodChange={(method) => onMethodChange(entry.id, method)}
            onPatch={(patch) => updateEntry(entry.id, patch)}
            onMakePrimary={() => setPrimary(entry.id)}
            onRemove={() => removeEntry(entry.id)}
          />
        ))}

        {entries.length < MAX_PAYOUT_METHODS ? (
          <button
            type="button"
            onClick={addEntry}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#7E5896] hover:text-[#6B4880] transition-colors"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            Add another payout method
          </button>
        ) : (
          <p className="text-xs text-gray-500">
            You can add up to {MAX_PAYOUT_METHODS} payout methods.
          </p>
        )}
      </div>

      <div className="mt-10 flex items-center gap-6 flex-wrap">
        <PrimaryButton onClick={onNext} disabled={!canContinue}>
          Next step
        </PrimaryButton>
        <WhyWeAsk title="When and how do payouts work?">
          <p>
            We hold each booking’s funds in escrow. The <strong>deposit</strong> is released to
            your account within 24 hours of the couple confirming, and the <strong>balance</strong>{' '}
            is released within 48 hours after the event.
          </p>
          <p>
            Money goes to your <strong>primary</strong> method by default; the others are kept on
            file as alternates. Mobile money payouts arrive instantly. Bank transfers take 1–2
            business days. We never charge a payout fee. TZS in, TZS out.
          </p>
        </WhyWeAsk>
      </div>
    </OnboardShell>
  )
}

function PayoutEntryCard({
  entry,
  index,
  canRemove,
  onMethodChange,
  onPatch,
  onMakePrimary,
  onRemove,
}: {
  entry: PayoutEntry
  index: number
  canRemove: boolean
  onMethodChange: (method: PayoutEntry['method']) => void
  onPatch: (patch: Partial<PayoutEntry>) => void
  onRemove: () => void
  onMakePrimary: () => void
}) {
  const selected = PAYOUT_OPTIONS.find((o) => o.id === entry.method)
  const isBank = entry.method === 'bank'
  const isLipaNamba = entry.method === 'lipa-namba'

  return (
    <section className="bg-white rounded-2xl border border-gray-200 shadow-[0_1px_2px_-1px_rgba(0,0,0,0.06),0_2px_8px_-3px_rgba(0,0,0,0.08)] p-6 lg:p-7 space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold tracking-tight text-gray-900">
            Payout method {index + 1}
          </h2>
          {entry.primary && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#F0DFF6] text-[#7E5896]">
              <Star className="w-2.5 h-2.5 fill-current" />
              Primary
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {!entry.primary && (
            <button
              type="button"
              onClick={onMakePrimary}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#7E5896] hover:text-[#6B4880] transition-colors"
            >
              <Star className="w-3.5 h-3.5" />
              Make primary
            </button>
          )}
          {canRemove && (
            <button
              type="button"
              onClick={onRemove}
              aria-label={`Remove payout method ${index + 1}`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-rose-600 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Remove
            </button>
          )}
        </div>
      </div>

      <div>
        <FieldLabel required>Method</FieldLabel>
        <SelectInput
          placeholder="Select a payout method"
          value={entry.method ?? ''}
          onChange={(e) => onMethodChange((e.target.value || null) as PayoutEntry['method'])}
        >
          {PAYOUT_OPTIONS.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </SelectInput>
      </div>

      {selected ? (
        <>
          {isBank ? (
            <div>
              <FieldLabel required>Bank</FieldLabel>
              <SelectInput
                placeholder="Select bank"
                value={entry.bankName}
                onChange={(e) => onPatch({ bankName: e.target.value })}
              >
                {TZ_BANKS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </SelectInput>
            </div>
          ) : null}

          {isLipaNamba ? (
            <div>
              <FieldLabel required>Network</FieldLabel>
              <SelectInput
                placeholder="Which provider issued this Lipa Namba?"
                value={entry.network}
                onChange={(e) => onPatch({ network: e.target.value })}
              >
                {LIPA_NAMBA_NETWORKS.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.label}
                  </option>
                ))}
              </SelectInput>
              <p className="mt-2 text-xs text-gray-500">
                Your Lipa Namba is registered with one of these networks. Pick whichever issued
                your merchant account.
              </p>
            </div>
          ) : null}

          <div>
            <FieldLabel required>{selected.numberLabel}</FieldLabel>
            <TextInput
              prefix={selected.prefix}
              placeholder={selected.numberPlaceholder}
              value={entry.number}
              onChange={(e) =>
                onPatch({
                  number:
                    isBank || isLipaNamba
                      ? e.target.value.replace(/[^\d\s-]/g, '')
                      : e.target.value.replace(/[^\d\s]/g, ''),
                })
              }
              inputMode={isBank || isLipaNamba ? 'numeric' : 'tel'}
            />
            {isLipaNamba ? (
              <p className="mt-2 text-xs text-gray-500">
                Usually 5–7 digits. You’ll find it on your M-Pesa for Business / merchant
                statement.
              </p>
            ) : null}
          </div>

          <div>
            <FieldLabel required>Account holder / business name</FieldLabel>
            <TextInput
              placeholder="As registered with your provider"
              value={entry.accountName}
              onChange={(e) => onPatch({ accountName: e.target.value })}
              autoComplete="name"
            />
            <p className="mt-2 text-xs text-gray-500">
              Must match the name registered with{' '}
              {isBank
                ? 'your bank'
                : isLipaNamba
                  ? 'your merchant account'
                  : 'your mobile money provider'}
              , or payouts will be rejected.
            </p>
          </div>
        </>
      ) : null}
    </section>
  )
}
