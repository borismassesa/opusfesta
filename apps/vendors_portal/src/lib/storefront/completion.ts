import type { OnboardingDraft } from '../onboarding/draft'

export type SectionStatus = 'complete' | 'partial' | 'empty' | 'auto'

export type StorefrontSection = {
  id: string
  label: string
  hint: string
  href: string
  status: SectionStatus
  required: boolean
  pageTitle: string
  pageDescription: string
}

const aboutComplete = (d: OnboardingDraft) =>
  d.bio.trim().length >= 80 && d.yearsInBusiness.trim() !== '' && d.languages.length > 0

const contactComplete = (d: OnboardingDraft) =>
  d.phone.trim() !== '' && d.whatsapp.trim() !== '' && d.email.trim() !== ''

const hoursComplete = (d: OnboardingDraft) =>
  Object.values(d.hours).some((h) => h.open && h.from && h.to)

const socialsCount = (d: OnboardingDraft) =>
  [d.socials.website, d.socials.instagram, d.socials.facebook, d.socials.tiktok].filter(
    (s) => s && s.trim() !== '',
  ).length

const packagesComplete = (d: OnboardingDraft) =>
  d.packages.length > 0 && d.packages.every((p) => p.name.trim() && p.price.trim())

const policiesComplete = (d: OnboardingDraft) =>
  Boolean(d.cancellationLevel) && Boolean(d.reschedulePolicy) && d.depositPercent.trim() !== ''

const payoutComplete = (d: OnboardingDraft) =>
  Boolean(d.payoutMethod) && d.payoutNumber.trim() !== '' && d.payoutAccountName.trim() !== ''

const faqStatus = (d: OnboardingDraft): SectionStatus => {
  const valid = d.faqs.filter((f) => f.question.trim() && f.answer.trim()).length
  if (valid === 0) return 'empty'
  if (valid >= 3) return 'complete'
  return 'partial'
}

const teamStatus = (d: OnboardingDraft): SectionStatus => {
  const valid = d.team.filter((m) => m.name.trim() && m.role.trim()).length
  if (valid === 0) return 'empty'
  if (valid >= 1) return 'complete'
  return 'partial'
}

const servicesStatus = (d: OnboardingDraft): SectionStatus => {
  const total = d.specialServices.length + d.customServices.length
  if (total === 0) return 'empty'
  if (total >= 3) return 'complete'
  return 'partial'
}

const PORTFOLIO_TARGET = 6
const COVER_SLOTS = 4

// Photos are stored in component state (blobs are too big for localStorage),
// so the editor reports back counts for both the fixed cover slots and the
// portfolio gallery. Both must hit their thresholds for the green tick.
const photosStatus = (d: OnboardingDraft): SectionStatus => {
  const covers = d.coverPhotoCount
  const portfolio = d.photoCount
  if (covers === 0 && portfolio === 0) return 'empty'
  if (covers >= COVER_SLOTS && portfolio >= PORTFOLIO_TARGET) return 'complete'
  return 'partial'
}

const recognitionStatus = (d: OnboardingDraft): SectionStatus => {
  const hasAwards = d.awards.trim() !== '' || d.awardCertificates.length > 0
  const filled = [hasAwards, d.responseTimeHours.trim() !== '', d.locallyOwned].filter(
    Boolean,
  ).length
  if (filled === 0) return 'empty'
  if (filled === 3) return 'complete'
  return 'partial'
}

export function getStorefrontSections(d: OnboardingDraft): StorefrontSection[] {
  // Profile is binary by design — couples need every contact channel before
  // booking, so a half-filled profile is treated as not started.
  const profileFilled =
    aboutComplete(d) && contactComplete(d) && hoursComplete(d) && socialsCount(d) > 0

  return [
    {
      id: 'about',
      label: 'Profile',
      hint: 'About, contact, hours, socials',
      href: '/storefront/about',
      status: profileFilled ? 'complete' : 'empty',
      required: true,
      pageTitle: 'Profile',
      pageDescription: 'Your bio, business hours, and contact details.',
    },
    {
      id: 'photos',
      label: 'Photos & videos',
      hint: 'Hero gallery and portfolio',
      href: '/storefront/photos',
      status: photosStatus(d),
      required: true,
      pageTitle: 'Photos & videos',
      pageDescription: 'Your hero shot, portfolio gallery, and video reels.',
    },
    {
      id: 'services',
      label: 'Services',
      hint: 'What couples can book you for',
      href: '/storefront/services',
      status: servicesStatus(d),
      required: true,
      pageTitle: 'Services offered',
      pageDescription: 'What couples can book — also powers search filters.',
    },
    {
      id: 'recognition',
      label: 'Awards & Recognition',
      hint: 'Awards, response time, badges',
      href: '/storefront/recognition',
      status: recognitionStatus(d),
      required: false,
      pageTitle: 'Awards & Recognition',
      pageDescription: 'Awards, response time, and trust badges.',
    },
    {
      id: 'packages',
      label: 'Packages & pricing',
      hint: 'Service tiers and pricing',
      href: '/storefront/packages',
      status: packagesComplete(d) && policiesComplete(d) && payoutComplete(d)
        ? 'complete'
        : packagesComplete(d)
          ? 'partial'
          : 'empty',
      required: true,
      pageTitle: 'Packages & pricing',
      pageDescription: 'Service tiers, deposits, and how you get paid.',
    },
    {
      id: 'team',
      label: 'Team members',
      hint: 'Staff bios and photos',
      href: '/storefront/team',
      status: teamStatus(d),
      required: false,
      pageTitle: 'Team members',
      pageDescription: 'Names, roles, and short bios for your team.',
    },
    {
      id: 'faq',
      label: 'FAQ',
      hint: 'Answer common questions upfront',
      href: '/storefront/faq',
      status: faqStatus(d),
      required: false,
      pageTitle: 'Frequently asked questions',
      pageDescription: 'Pre-empt the questions couples always ask.',
    },
  ]
}

export function computeCompleteness(sections: StorefrontSection[]) {
  const trackable = sections.filter((s) => s.status !== 'auto')
  const total = trackable.length
  const complete = trackable.filter((s) => s.status === 'complete').length
  const partial = trackable.filter((s) => s.status === 'partial').length
  // Partial counts as half-credit for the headline percentage.
  const percent = total === 0 ? 0 : Math.round(((complete + partial * 0.5) / total) * 100)
  const requiredMissing = sections.filter(
    (s) => s.required && s.status !== 'complete' && s.status !== 'auto',
  )
  return { percent, complete, total, requiredMissing }
}
