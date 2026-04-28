import type { OnboardingDraft } from '../onboarding/draft'

export type ProfileErrorKey =
  | 'businessName'
  | 'firstName'
  | 'lastName'
  | 'bio'
  | 'street'
  | 'city'
  | 'region'
  | 'phone'
  | 'whatsapp'
  | 'email'

export type ProfileErrors = Partial<Record<ProfileErrorKey, string>>

const MIN_BIO = 80
const TZ_PHONE_DIGITS = 9

const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim())

const phoneDigits = (s: string) => s.replace(/\D/g, '')

export function validateProfile(d: OnboardingDraft): ProfileErrors {
  const errors: ProfileErrors = {}

  if (!d.businessName.trim()) errors.businessName = 'Business name is required.'
  if (!d.firstName.trim()) errors.firstName = 'First name is required.'
  if (!d.lastName.trim()) errors.lastName = 'Last name is required.'

  const bio = d.bio.trim()
  if (!bio) {
    errors.bio = 'Bio is required.'
  } else if (bio.length < MIN_BIO) {
    errors.bio = `${MIN_BIO - bio.length} more character${MIN_BIO - bio.length === 1 ? '' : 's'} needed (min ${MIN_BIO}).`
  }

  if (!d.street.trim()) errors.street = 'Street address is required.'
  if (!d.city.trim()) errors.city = 'City is required.'
  if (!d.region) errors.region = 'Region is required.'

  if (d.phone && phoneDigits(d.phone).length !== TZ_PHONE_DIGITS) {
    errors.phone = 'Phone must be 9 digits after +255.'
  }
  if (d.whatsapp && phoneDigits(d.whatsapp).length !== TZ_PHONE_DIGITS) {
    errors.whatsapp = 'WhatsApp must be 9 digits after +255.'
  }
  if (d.email && !isValidEmail(d.email)) {
    errors.email = 'Enter a valid email address.'
  }

  return errors
}

export function formatRelativeSaved(savedAt: Date | null, now: Date = new Date()): string | null {
  if (!savedAt) return null
  const diffMs = now.getTime() - savedAt.getTime()
  const diffSec = Math.round(diffMs / 1000)
  if (diffSec < 5) return 'Saved just now'
  if (diffSec < 60) return `Saved ${diffSec} seconds ago`
  const diffMin = Math.round(diffSec / 60)
  if (diffMin === 1) return 'Saved 1 minute ago'
  if (diffMin < 60) return `Saved ${diffMin} minutes ago`
  const diffHr = Math.round(diffMin / 60)
  if (diffHr === 1) return 'Saved 1 hour ago'
  if (diffHr < 24) return `Saved ${diffHr} hours ago`
  return `Saved ${savedAt.toLocaleDateString('en-TZ')}`
}
