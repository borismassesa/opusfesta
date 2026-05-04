// OF-ENG-SPEC-002 — Vendor accounts admin page redesign
// Data contracts for the list page. The UI consumes `VendorAccount` and
// `QueueHealth`; the server page projects raw Supabase rows into these
// shapes so the client doesn't have to know about column names.

export type VendorStatus =
  | 'awaiting_review'
  | 'needs_corrections'
  | 'uploading_docs'
  | 'drafting'
  | 'active'
  | 'suspended'

export type VendorCategory =
  | 'venues'
  | 'photographers'
  | 'videographers'
  | 'caterers'
  | 'decor'
  | 'mcs'
  | 'beauty'
  | 'cakes'
  | 'transport'
  | 'attire'

export type AgreementStatus = 'signed' | 'pending' | 'declined'

export interface VendorAccount {
  id: string
  publicId: string
  businessName: string
  category: string
  city: string | null
  submittedByName: string | null
  submittedAt: string | null
  createdAt: string
  agreementStatus: AgreementStatus
  documentsVerified: number
  documentsTotal: number
  reviewerId: string | null
  status: VendorStatus
  logoUrl: string | null
}

export interface QueueHealth {
  inQueue: number
  avgReviewTimeDays: number
  slaAtRisk: number
}

export interface VendorStatusCounts {
  awaiting_review: number
  needs_corrections: number
  uploading_docs: number
  drafting: number
  active: number
  suspended: number
  all: number
}

// Mapping between the DB enum (`onboarding_status`) and the spec's
// `VendorStatus`. The DB names match more closely with the queue lifecycle;
// the spec names are reviewer-friendly.
export const DB_STATUS_TO_VENDOR_STATUS: Record<string, VendorStatus> = {
  application_in_progress: 'drafting',
  verification_pending: 'uploading_docs',
  admin_review: 'awaiting_review',
  needs_corrections: 'needs_corrections',
  active: 'active',
  suspended: 'suspended',
}

export const VENDOR_STATUS_TO_DB: Record<VendorStatus, string> = {
  drafting: 'application_in_progress',
  uploading_docs: 'verification_pending',
  awaiting_review: 'admin_review',
  needs_corrections: 'needs_corrections',
  active: 'active',
  suspended: 'suspended',
}
