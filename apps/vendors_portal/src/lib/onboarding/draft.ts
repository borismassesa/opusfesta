'use client'

import { useCallback, useEffect, useState } from 'react'
import type { PackageDraft } from './packages'

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
export type PayoutMethod =
  | 'mpesa'
  | 'airtel-money'
  | 'tigopesa'
  | 'halopesa'
  | 'lipa-namba'
  | 'bank'
  | null

export type OnboardingDraft = {
  categoryId: string | null
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
  payoutMethod: PayoutMethod
  payoutNumber: string
  payoutAccountName: string
  payoutBankName: string
  payoutNetwork: string
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

const STORAGE_KEY = 'opusfesta:vendor-onboarding-draft'

const EMPTY: OnboardingDraft = {
  categoryId: null,
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
  payoutMethod: null,
  payoutNumber: '',
  payoutAccountName: '',
  payoutBankName: '',
  payoutNetwork: '',
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

function readDraft(): OnboardingDraft {
  if (typeof window === 'undefined') return EMPTY
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY
    const parsed = JSON.parse(raw) as Partial<OnboardingDraft>
    return { ...EMPTY, ...parsed }
  } catch {
    return EMPTY
  }
}

function writeDraft(draft: OnboardingDraft) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
  } catch {
    // ignore quota / private browsing errors — UX still works in-memory
  }
}

export function useOnboardingDraft() {
  const [draft, setDraft] = useState<OnboardingDraft>(EMPTY)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setDraft(readDraft())
    setHydrated(true)
  }, [])

  const update = useCallback((patch: Partial<OnboardingDraft>) => {
    setDraft((prev) => {
      const next = { ...prev, ...patch }
      writeDraft(next)
      return next
    })
  }, [])

  const reset = useCallback(() => {
    setDraft(EMPTY)
    if (typeof window !== 'undefined') window.localStorage.removeItem(STORAGE_KEY)
  }, [])

  return { draft, update, reset, hydrated }
}

export function clearOnboardingDraft() {
  if (typeof window !== 'undefined') window.localStorage.removeItem(STORAGE_KEY)
}
