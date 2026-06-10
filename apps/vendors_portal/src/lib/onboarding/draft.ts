'use client'

import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import type { PackageDraft } from './packages'
import {
  emptyPayoutEntry,
  hasCompletePayout,
  isPayoutEntryComplete,
  newPayoutEntryId,
  primaryPayoutEntry,
  type PayoutEntry,
  type PayoutMethod,
} from './payout'

// The pure payout helpers/types live in the (non-client) ./payout module so
// server code can use them without crossing the client boundary. Re-export them
// here so existing importers of '@/lib/onboarding/draft' keep working.
export {
  emptyPayoutEntry,
  hasCompletePayout,
  isPayoutEntryComplete,
  newPayoutEntryId,
  primaryPayoutEntry,
}
export type { PayoutEntry, PayoutMethod }

export type DayHours = {
  open: boolean
  from: string
  to: string
}

export type BusinessHours = {
  mon: DayHours
  tue: DayHours
  wed: DayHours
  thu: DayHours
  fri: DayHours
  sat: DayHours
  sun: DayHours
}

export type SocialLinks = {
  website: string
  instagram: string
  facebook: string
  tiktok: string
  whatsapp: string
}

export type FAQItem = {
  id: string
  question: string
  answer: string
}

export type TeamMember = {
  id: string
  name: string
  role: string
  bio: string
  // Avatars are session-only blob URLs (the editor calls URL.createObjectURL).
  // Persisting full image data in localStorage would blow the quota — once a
  // backend storage layer lands, swap this for a permanent URL.
  avatarUrl?: string
}

// The Availability tab represents the vendor's *operating* posture (when they
// can work) — booking entries themselves live in the Bookings module so the
// two responsibilities don't bleed into each other.
export type AvailabilityStatus = 'unavailable'

export type AvailabilityDate = {
  // Local date in YYYY-MM-DD form. Times-of-day aren't needed at this layer.
  date: string
  status: AvailabilityStatus
  // Free-text context — vacation, training, personal leave.
  note?: string
}

export type AwardCertStatus = 'pending' | 'verified' | 'needs_info' | 'rejected'

export type AwardCertificate = {
  id: string
  title: string
  issuer: string
  year: string
  fileName: string
  status: AwardCertStatus
  // Reviewer message — populated for needs_info / rejected, optional for others.
  notes?: string
  submittedAt: string
  verifiedAt?: string | null
}

export type CancellationLevel = 'flexible' | 'moderate' | 'strict' | null
export type ReschedulePolicy = 'one-free' | 'unlimited' | 'none' | null

export type OnboardingDraft = {
  categoryId: string | null
  // Free-text "what does your business do" — required when the chosen
  // category has requiresDetail (the "Others" card), empty otherwise.
  customCategory: string
  vowsAccepted: boolean
  firstName: string
  lastName: string
  businessName: string
  street: string
  street2: string
  city: string
  region: string
  postalCode: string
  phone: string
  email: string
  whatsapp: string
  homeMarket: string | null
  serviceMarkets: string[]
  bio: string
  yearsInBusiness: string
  languages: string[]
  specialServices: string[]
  customServices: string[]
  style: string | null
  personality: string | null
  packages: PackageDraft[]
  startingPrice: string
  customQuotes: boolean
  depositPercent: string
  cancellationLevel: CancellationLevel
  reschedulePolicy: ReschedulePolicy
  payoutMethods: PayoutEntry[]
  hours: BusinessHours
  socials: SocialLinks
  awards: string
  locallyOwned: boolean
  responseTimeHours: string
  faqs: FAQItem[]
  team: TeamMember[]
  availability: AvailabilityDate[]
  // How many bookings the vendor's team can run in parallel on the same day.
  // Solo operators leave this at 1 — venues / multi-team studios bump it up.
  parallelBookingCapacity: number
  awardCertificates: AwardCertificate[]
  // Photos and videos themselves are large blobs we don't want in localStorage
  // — the editor keeps the content in component state and reports back the
  // counts so the storefront sidebar can show progress for the section.
  photoCount: number
  videoCount: number
  // Cover slots are fixed at 4 (3 landscape + 1 portrait). We mirror the
  // filled-slot count here so the storefront sidebar can grade completion
  // without persisting the (often blob-URL) image data itself.
  coverPhotoCount: number
  submittedAt: string | null
}

const defaultHours = (open: boolean, from = '09:00', to = '18:00'): DayHours => ({ open, from, to })

const DEFAULT_HOURS: BusinessHours = {
  mon: defaultHours(true),
  tue: defaultHours(true),
  wed: defaultHours(true),
  thu: defaultHours(true),
  fri: defaultHours(true),
  sat: defaultHours(true, '10:00', '20:00'),
  sun: defaultHours(false),
}

const DEFAULT_SOCIALS: SocialLinks = {
  website: '',
  instagram: '',
  facebook: '',
  tiktok: '',
  whatsapp: '',
}

// Per-user storage. The draft used to live under a single global key, which
// meant a SHARED device (a staff laptop demoing signups, a phone passed
// between vendors, an internet café) leaked the previous vendor's draft —
// including PII like phone, email, and payout/bank account numbers — into the
// next vendor's onboarding form. Scoping the key to the Clerk user id makes
// that impossible: a different signed-in user reads a different key.
const STORAGE_PREFIX = 'opusfesta:vendor-onboarding-draft'

// The old un-scoped key. It may hold a *different* vendor's data, so we never
// inherit it — we delete it on load (see `useOnboardingDraft`), closing the
// cross-vendor leak for good.
const LEGACY_STORAGE_KEY = STORAGE_PREFIX

function storageKey(userId: string): string {
  return `${STORAGE_PREFIX}:${userId}`
}

const EMPTY: OnboardingDraft = {
  categoryId: null,
  customCategory: '',
  vowsAccepted: false,
  firstName: '',
  lastName: '',
  businessName: '',
  street: '',
  street2: '',
  city: '',
  region: '',
  postalCode: '',
  phone: '',
  email: '',
  whatsapp: '',
  homeMarket: null,
  serviceMarkets: [],
  bio: '',
  yearsInBusiness: '',
  languages: [],
  specialServices: [],
  customServices: [],
  style: null,
  personality: null,
  packages: [],
  startingPrice: '',
  customQuotes: false,
  depositPercent: '30',
  cancellationLevel: null,
  reschedulePolicy: null,
  payoutMethods: [],
  hours: DEFAULT_HOURS,
  socials: DEFAULT_SOCIALS,
  awards: '',
  locallyOwned: false,
  responseTimeHours: '',
  faqs: [],
  team: [],
  availability: [],
  parallelBookingCapacity: 1,
  awardCertificates: [],
  photoCount: 0,
  videoCount: 0,
  coverPhotoCount: 0,
  submittedAt: null,
}

// Legacy single-payout fields stored by drafts created before multi-payout
// support. Read off the raw JSON so we can migrate them into the new array.
type LegacyPayoutShape = {
  payoutMethod?: PayoutMethod
  payoutNumber?: string
  payoutAccountName?: string
  payoutBankName?: string
  payoutNetwork?: string
}

function readDraft(userId: string | null): OnboardingDraft {
  if (typeof window === 'undefined' || !userId) return EMPTY
  try {
    const raw = window.localStorage.getItem(storageKey(userId))
    if (!raw) return EMPTY
    const parsed = JSON.parse(raw) as Partial<OnboardingDraft> & LegacyPayoutShape
    const merged = { ...EMPTY, ...parsed }
    // Migrate a legacy single payout method into the array so drafts started
    // before multi-payout don't lose what the vendor already entered.
    if (merged.payoutMethods.length === 0 && parsed.payoutMethod) {
      merged.payoutMethods = [
        {
          id: newPayoutEntryId(),
          method: parsed.payoutMethod,
          number: parsed.payoutNumber ?? '',
          accountName: parsed.payoutAccountName ?? '',
          bankName: parsed.payoutBankName ?? '',
          network: parsed.payoutNetwork ?? '',
          primary: true,
        },
      ]
    }
    return merged
  } catch {
    return EMPTY
  }
}

// Internal broadcast — `useOnboardingDraft` is invoked independently by
// multiple components (the storefront sidebar, the section editors, the
// header completion meter) and each call owns its own `useState` copy.
// Without this event, one component's `update()` only refreshes its own
// copy: the sidebar keeps showing "needs more work" even after the photos
// page has marked everything complete. We dispatch a custom event on every
// write so every instance re-reads from localStorage.
const DRAFT_CHANGE_EVENT = 'opusfesta:onboarding-draft-changed'

function writeDraft(userId: string | null, draft: OnboardingDraft) {
  if (typeof window === 'undefined' || !userId) return
  try {
    window.localStorage.setItem(storageKey(userId), JSON.stringify(draft))
    // Defer the cross-instance broadcast. `writeDraft` is called from
    // inside the `setDraft` state updater in `update()` — dispatching
    // synchronously would call listeners' setState during the calling
    // component's render/commit phase, which React warns about as a
    // cross-component setState-in-render. A microtask runs after the
    // current updater returns but before paint, so the sidebar still
    // refreshes in the same tick.
    queueMicrotask(() => {
      window.dispatchEvent(
        new CustomEvent(DRAFT_CHANGE_EVENT, { detail: draft }),
      )
    })
  } catch {
    // ignore quota / private browsing errors — UX still works in-memory
  }
}

export function useOnboardingDraft() {
  // The draft is keyed to the signed-in vendor, so we must wait for Clerk to
  // resolve the user before reading — otherwise we'd read EMPTY (or, worse, the
  // wrong key) and flash stale UI.
  const { isLoaded, userId: clerkUserId } = useAuth()
  const userId = clerkUserId ?? null
  const [draft, setDraft] = useState<OnboardingDraft>(EMPTY)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    if (!isLoaded) return

    // One-time purge of the legacy un-scoped key. It may belong to a *different*
    // vendor who used this device before, so we never read it into the form —
    // we delete it outright. This is what closes the cross-vendor data leak.
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(LEGACY_STORAGE_KEY)
    }

    setDraft(readDraft(userId))
    setHydrated(true)

    if (!userId) return

    // Listen for cross-instance updates so every consumer of the hook
    // converges on the latest persisted draft. Same-tab updates come
    // through the custom event; cross-tab updates use the native
    // `storage` event (scoped to THIS user's key).
    const key = storageKey(userId)
    const onChange = (event: Event) => {
      const detail = (event as CustomEvent<OnboardingDraft>).detail
      if (detail) {
        setDraft(detail)
      } else {
        setDraft(readDraft(userId))
      }
    }
    const onStorage = (event: StorageEvent) => {
      if (event.key === key) setDraft(readDraft(userId))
    }
    window.addEventListener(DRAFT_CHANGE_EVENT, onChange)
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener(DRAFT_CHANGE_EVENT, onChange)
      window.removeEventListener('storage', onStorage)
    }
  }, [isLoaded, userId])

  const update = useCallback(
    (patch: Partial<OnboardingDraft>) => {
      setDraft((prev) => {
        const next = { ...prev, ...patch }
        writeDraft(userId, next)
        return next
      })
    },
    [userId],
  )

  const reset = useCallback(() => {
    setDraft(EMPTY)
    if (typeof window !== 'undefined' && userId) {
      window.localStorage.removeItem(storageKey(userId))
      window.dispatchEvent(
        new CustomEvent(DRAFT_CHANGE_EVENT, { detail: EMPTY }),
      )
    }
  }, [userId])

  return { draft, update, reset, hydrated }
}

export function clearOnboardingDraft(userId?: string) {
  if (typeof window === 'undefined') return
  // Always drop the legacy global key; drop the per-user key when we know who.
  window.localStorage.removeItem(LEGACY_STORAGE_KEY)
  if (userId) window.localStorage.removeItem(storageKey(userId))
}
