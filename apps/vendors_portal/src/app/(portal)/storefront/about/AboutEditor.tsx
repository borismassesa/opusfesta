'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  AlertCircle,
  ArrowRight,
  Check,
  Facebook,
  Globe,
  Instagram,
  MapPin,
  MessageCircle,
  Music,
  Save,
} from 'lucide-react'
import { OptionCard } from '@/components/onboard/OptionCard'
import {
  FieldLabel,
  SelectInput,
  TextArea,
  TextInput,
} from '@/components/onboard/FormField'
import { useOnboardingDraft, type DayHours } from '@/lib/onboarding/draft'
import { LANGUAGES } from '@/lib/onboarding/languages'
import { getStylesForCategory } from '@/lib/onboarding/styles'
import { PERSONALITY_OPTIONS } from '@/lib/onboarding/personality'
import {
  SERVICE_MARKETS,
  TZ_REGIONS,
  homeMarketForRegion,
} from '@/lib/onboarding/regions'
import { saveProfile } from './actions'
import { saveProfileFields } from '../sections/actions'
import { getStorefrontSections } from '@/lib/storefront/completion'
import { profilesEqual, type DbProfile } from './mapping'

const DAYS = [
  { key: 'mon', label: 'Monday', short: 'Mon' },
  { key: 'tue', label: 'Tuesday', short: 'Tue' },
  { key: 'wed', label: 'Wednesday', short: 'Wed' },
  { key: 'thu', label: 'Thursday', short: 'Thu' },
  { key: 'fri', label: 'Friday', short: 'Fri' },
  { key: 'sat', label: 'Saturday', short: 'Sat' },
  { key: 'sun', label: 'Sunday', short: 'Sun' },
] as const

type DayKey = (typeof DAYS)[number]['key']

const MIN_BIO = 80

export type AboutSource =
  | { kind: 'live' }
  | { kind: 'no-application' }
  | { kind: 'pending-approval' }
  | { kind: 'suspended' }
  | { kind: 'no-env' }

const BANNER_BY_SOURCE: Record<AboutSource['kind'], string | null> = {
  live: null,
  'no-application':
    "You haven't started a vendor application yet. Apply to do business on OpusFesta to edit your storefront.",
  'pending-approval':
    'Your vendor application is awaiting OpusFesta verification. Editing unlocks once your account is approved.',
  suspended:
    'Your vendor account is suspended. Contact OpusFesta support if you believe this is a mistake.',
  'no-env':
    'DEV: Vendor backend not connected — Save is disabled. Check Supabase env vars and that migrations are applied to your Supabase project.',
}

type AboutEditorProps = {
  source: AboutSource
  initialProfile: DbProfile
  canEdit: boolean
}

export default function AboutEditor({
  source,
  initialProfile,
  canEdit,
}: AboutEditorProps) {
  const router = useRouter()
  // Wireable fields: hydrated from vendors row, edited in local React state,
  // persisted via the saveProfile server action.
  const [profile, setProfile] = useState<DbProfile>(initialProfile)
  const [savedSnapshot, setSavedSnapshot] = useState<DbProfile>(initialProfile)
  // Non-wireable fields (firstName/lastName/languages/style/personality/
  // markets/hours/responseTimeHours/locallyOwned) still live in the
  // localStorage onboarding draft. Phase 5 will extend the schema and
  // replace these reads.
  const { draft, update, hydrated } = useOnboardingDraft()
  const [pending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<
    { kind: 'success' | 'error'; message: string } | null
  >(null)

  // Sync local state when the server re-renders with fresh data — same
  // pattern as the packages editor. Without this useState would only ever
  // see the mount-time seed and drift from DB after another tab saves.
  useEffect(() => {
    setProfile(initialProfile)
    setSavedSnapshot(initialProfile)
  }, [initialProfile])

  const banner = BANNER_BY_SOURCE[source.kind]
  const styles = getStylesForCategory(draft.categoryId)
  const homeMarket = homeMarketForRegion(profile.region)
  const homeMarketName = SERVICE_MARKETS.find((m) => m.id === homeMarket)?.name
  const extraMarkets = SERVICE_MARKETS.filter((m) => m.id !== homeMarket)

  // Snapshot of the draft-only fields at last save (or hydration). We need
  // this so the Save button enables when the vendor changes only
  // languages / style / hours / etc. — fields that don't live in
  // `profile`. Without it, "dirty" was driven entirely by profile changes
  // and the button stayed disabled for draft-only edits.
  const [draftSnapshot, setDraftSnapshot] = useState(() => snapshotDraft(draft))
  useEffect(() => {
    // Re-snapshot once localStorage has hydrated so we don't keep the
    // EMPTY default as the baseline.
    if (hydrated) setDraftSnapshot(snapshotDraft(draft))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated])

  const isDirty = useMemo(() => {
    if (!profilesEqual(profile, savedSnapshot)) return true
    return !draftsEqual(snapshotDraft(draft), draftSnapshot)
  }, [profile, savedSnapshot, draft, draftSnapshot])

  // Resolve the next storefront section so the bottom bar's "Next" button
  // mirrors the flow on every other section page. Same helper the sidebar
  // uses, so the order stays in sync.
  const nextHref = useMemo(() => {
    const sections = getStorefrontSections(draft)
    const idx = sections.findIndex((s) => s.id === 'about')
    return idx >= 0 && idx < sections.length - 1 ? sections[idx + 1].href : null
  }, [draft])

  const onNext = () => {
    if (nextHref) router.push(nextHref)
  }

  const bioLength = profile.bio.trim().length
  const bioHint =
    bioLength === 0
      ? `Min ${MIN_BIO} characters.`
      : bioLength < MIN_BIO
        ? `${MIN_BIO - bioLength} more character${MIN_BIO - bioLength === 1 ? '' : 's'} to go (min ${MIN_BIO}).`
        : `${bioLength} characters — looking good.`

  const setField = <K extends keyof DbProfile>(key: K, value: DbProfile[K]) => {
    setProfile((p) => ({ ...p, [key]: value }))
    setFeedback(null)
  }

  const toggleLanguage = (id: string) => {
    if (!canEdit) return
    const set = new Set(draft.languages)
    if (set.has(id)) set.delete(id)
    else set.add(id)
    update({ languages: Array.from(set) })
  }

  const toggleServiceMarket = (id: string) => {
    if (!canEdit || id === homeMarket) return
    const set = new Set(draft.serviceMarkets)
    if (set.has(id)) set.delete(id)
    else set.add(id)
    update({ serviceMarkets: Array.from(set) })
  }

  const updateDay = (key: DayKey, patch: Partial<DayHours>) => {
    if (!canEdit) return
    update({ hours: { ...draft.hours, [key]: { ...draft.hours[key], ...patch } } })
  }

  const handleSave = () => {
    if (!canEdit) return
    setFeedback(null)
    startTransition(async () => {
      // Two writes in parallel — saveProfile owns the DB-backed
      // identity fields (bio, contact, location, socials), while
      // saveProfileFields owns the structured columns the About page
      // had been keeping on local draft only (hours, style,
      // personality, languages, service markets). Running them together
      // means one click persists everything the vendor sees on this
      // page, so "draft" badges actually clear after Save.
      const [profileResult, fieldsResult] = await Promise.all([
        isDirty
          ? saveProfile(profile)
          : Promise.resolve({ ok: true as const }),
        saveProfileFields({
          hours: draft.hours,
          style: draft.style || null,
          personality: draft.personality || null,
          homeMarket: homeMarket ?? null,
          serviceMarkets: draft.serviceMarkets,
          languages: draft.languages,
        }),
      ])
      if (!profileResult.ok) {
        setFeedback({ kind: 'error', message: profileResult.error })
        if ('reason' in profileResult && profileResult.reason === 'stale') {
          router.refresh()
        }
        return
      }
      if (!fieldsResult.ok) {
        setFeedback({ kind: 'error', message: fieldsResult.error })
        return
      }
      setSavedSnapshot(profile)
      setDraftSnapshot(snapshotDraft(draft))
      // Mirror the DB-backed profile fields into the onboarding draft
      // so the storefront sidebar's completion checks (which read from
      // the draft) reflect the just-saved values. Without this, the
      // vendor saves a complete bio / contact / socials but the sidebar
      // keeps showing "needs more work" because draft.bio etc. are
      // still empty.
      update({
        bio: profile.bio,
        yearsInBusiness: profile.yearsInBusiness,
        phone: profile.phone,
        email: profile.email,
        whatsapp: profile.whatsapp,
        socials: {
          website: profile.socialWebsite,
          instagram: profile.socialInstagram,
          facebook: profile.socialFacebook,
          tiktok: profile.socialTiktok,
          whatsapp: profile.socialWhatsapp,
        },
      })
      setFeedback({ kind: 'success', message: 'Profile saved.' })
    })
  }

  const saveDisabled = !canEdit || !isDirty || pending || source.kind !== 'live'

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex-1 px-6 lg:px-10 pt-4 lg:pt-5 pb-6">
        {banner && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-800">
            {banner}
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Owner & business */}
          <Section
            title="Owner & business"
            hint="Who runs the storefront and how the business is registered."
            className="lg:col-span-2"
          >
            <div className="space-y-4">
              <div data-field="businessName">
                <FieldLabel required>Business name</FieldLabel>
                <TextInput
                  value={profile.businessName}
                  onChange={(e) => setField('businessName', e.target.value)}
                  autoComplete="organization"
                  placeholder="e.g. Festa Films"
                  disabled={!canEdit}
                />
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <FieldLabel>
                    First name <DraftBadge />
                  </FieldLabel>
                  <TextInput
                    value={hydrated ? draft.firstName : ''}
                    onChange={(e) => update({ firstName: e.target.value })}
                    autoComplete="given-name"
                    disabled={!canEdit}
                  />
                </div>
                <div>
                  <FieldLabel>
                    Last name <DraftBadge />
                  </FieldLabel>
                  <TextInput
                    value={hydrated ? draft.lastName : ''}
                    onChange={(e) => update({ lastName: e.target.value })}
                    autoComplete="family-name"
                    disabled={!canEdit}
                  />
                </div>
                <div>
                  <FieldLabel>Years in business</FieldLabel>
                  <TextInput
                    inputMode="numeric"
                    value={profile.yearsInBusiness}
                    onChange={(e) =>
                      setField(
                        'yearsInBusiness',
                        e.target.value.replace(/[^\d]/g, '').slice(0, 3),
                      )
                    }
                    placeholder="e.g. 5"
                    disabled={!canEdit}
                  />
                </div>
              </div>
            </div>
          </Section>

          {/* Business address (all wireable via location JSONB) */}
          <Section
            title="Business address"
            hint="Only your city and region appear publicly. Full address stays private."
            className="lg:col-span-2"
          >
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <FieldLabel required>Building / Plot number</FieldLabel>
                  <TextInput
                    placeholder="e.g. Plot 24, Building 12B"
                    value={profile.houseNumber}
                    onChange={(e) => setField('houseNumber', e.target.value)}
                    autoComplete="address-line1"
                    disabled={!canEdit}
                  />
                </div>
                <div>
                  <FieldLabel required>Street / Village</FieldLabel>
                  <TextInput
                    placeholder="e.g. Mwenge"
                    value={profile.street}
                    onChange={(e) => setField('street', e.target.value)}
                    autoComplete="address-line2"
                    disabled={!canEdit}
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <FieldLabel required>Ward</FieldLabel>
                  <TextInput
                    placeholder="e.g. Kinondoni"
                    value={profile.ward}
                    onChange={(e) => setField('ward', e.target.value)}
                    disabled={!canEdit}
                  />
                </div>
                <div>
                  <FieldLabel required>District</FieldLabel>
                  <TextInput
                    placeholder="e.g. Kinondoni"
                    value={profile.district}
                    onChange={(e) => setField('district', e.target.value)}
                    autoComplete="address-level2"
                    disabled={!canEdit}
                  />
                </div>
                <div>
                  <FieldLabel required>Region</FieldLabel>
                  <SelectInput
                    placeholder="Select region"
                    value={profile.region}
                    onChange={(e) => setField('region', e.target.value)}
                    disabled={!canEdit}
                  >
                    {TZ_REGIONS.map((r) => (
                      <option key={r.code} value={r.code}>
                        {r.name}
                      </option>
                    ))}
                  </SelectInput>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <FieldLabel>Landmark / directions (optional)</FieldLabel>
                  <TextInput
                    placeholder="e.g. Near Mlimani City, opposite the mosque"
                    value={profile.landmark}
                    onChange={(e) => setField('landmark', e.target.value)}
                    disabled={!canEdit}
                  />
                </div>
                <div>
                  <FieldLabel>P.O. Box / Postal code (optional)</FieldLabel>
                  <TextInput
                    placeholder="e.g. P.O. Box 1234 or 11101"
                    value={profile.postalCode}
                    onChange={(e) => setField('postalCode', e.target.value)}
                    autoComplete="postal-code"
                    disabled={!canEdit}
                  />
                </div>
              </div>
            </div>
          </Section>

          {/* Contact details — onboarding "Contact" step.
              Wireable via contact_info JSONB. */}
          <Section
            title="Contact details"
            hint="Shared with couples after booking, not on your public storefront."
            className="lg:col-span-2"
          >
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <FieldLabel>Business phone</FieldLabel>
                <TextInput
                  prefix="+255"
                  inputMode="tel"
                  value={profile.phone}
                  onChange={(e) =>
                    setField('phone', e.target.value.replace(/[^\d\s]/g, ''))
                  }
                  disabled={!canEdit}
                />
              </div>
              <div>
                <FieldLabel>WhatsApp number</FieldLabel>
                <TextInput
                  prefix="+255"
                  inputMode="tel"
                  value={profile.whatsapp}
                  onChange={(e) =>
                    setField('whatsapp', e.target.value.replace(/[^\d\s]/g, ''))
                  }
                  disabled={!canEdit}
                />
              </div>
              <div>
                <FieldLabel>Business email</FieldLabel>
                <TextInput
                  type="email"
                  inputMode="email"
                  placeholder="hello@yourbusiness.co.tz"
                  value={profile.email}
                  onChange={(e) => setField('email', e.target.value)}
                  disabled={!canEdit}
                />
              </div>
            </div>
          </Section>

          {/* Socials — onboarding "Socials" step.
              Wireable via social_links JSONB. */}
          <Section
            title="Social media & website"
            hint="Optional. Helps couples explore your work."
            className="lg:col-span-2"
          >
            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
              <SocialRow
                icon={<Globe className="w-4 h-4" />}
                label="Website"
                placeholder="https://yourstudio.co.tz"
                value={profile.socialWebsite}
                onChange={(v) => setField('socialWebsite', v)}
                disabled={!canEdit}
              />
              <SocialRow
                icon={<MessageCircle className="w-4 h-4" />}
                label="WhatsApp Business"
                placeholder="+255 754 123 456"
                value={profile.socialWhatsapp}
                onChange={(v) => setField('socialWhatsapp', v)}
                disabled={!canEdit}
              />
              <SocialRow
                icon={<Instagram className="w-4 h-4" />}
                label="Instagram"
                placeholder="@yourstudio"
                value={profile.socialInstagram}
                onChange={(v) => setField('socialInstagram', v)}
                disabled={!canEdit}
              />
              <SocialRow
                icon={<Facebook className="w-4 h-4" />}
                label="Facebook"
                placeholder="facebook.com/yourstudio"
                value={profile.socialFacebook}
                onChange={(v) => setField('socialFacebook', v)}
                disabled={!canEdit}
              />
              <SocialRow
                icon={<Music className="w-4 h-4" />}
                label="TikTok"
                placeholder="@yourstudio"
                value={profile.socialTiktok}
                onChange={(v) => setField('socialTiktok', v)}
                disabled={!canEdit}
              />
            </div>
          </Section>

          {/* Service area — onboarding "Markets" step.
              Persisted to vendors.home_market / vendors.service_markets on Save. */}
          <Section
            title="Service area"
            className="lg:col-span-2"
          >
            <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 flex items-center gap-3 mb-5">
              <span className="w-7 h-7 rounded-lg bg-gray-900 text-white flex items-center justify-center shrink-0">
                <MapPin className="w-3.5 h-3.5" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">
                  {homeMarketName ?? 'Home market not set'}
                </p>
                <p className="text-xs text-gray-500">
                  Home market, auto-set from your region above.
                </p>
              </div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-gray-500">
                Home
              </span>
            </div>

            <FieldLabel>Additional markets you serve</FieldLabel>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
              {extraMarkets.map((m) => (
                <OptionCard
                  key={m.id}
                  variant="checkbox"
                  label={m.name}
                  description={m.hint}
                  selected={hydrated && draft.serviceMarkets.includes(m.id)}
                  onToggle={() => toggleServiceMarket(m.id)}
                />
              ))}
            </div>
          </Section>

          {/* Bio — onboarding "About" step (bio + languages).
              Bio wireable; languages persisted via saveProfileFields. */}
          <Section
            title="Bio"
            hint="What couples read first on your storefront."
            className="lg:col-span-2"
          >
            <div className="space-y-5">
              <div>
                <FieldLabel required>Description</FieldLabel>
                <TextArea
                  value={profile.bio}
                  onChange={(e) => setField('bio', e.target.value)}
                  rows={6}
                  hint={bioHint}
                  disabled={!canEdit}
                />
              </div>
              <div>
                <FieldLabel>
                  Languages spoken with clients
                </FieldLabel>
                <div className="grid sm:grid-cols-3 lg:grid-cols-4 gap-2 mt-1">
                  {LANGUAGES.map((lang) => (
                    <OptionCard
                      key={lang.id}
                      variant="checkbox"
                      label={lang.label}
                      selected={hydrated && draft.languages.includes(lang.id)}
                      onToggle={() => toggleLanguage(lang.id)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </Section>

          {/* Style & personality — onboarding "Style" + "Personality" steps.
              Persisted to vendors.style / vendors.personality on Save. */}
          <Section
            title="Style & personality"
            className="lg:col-span-2"
          >
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <FieldLabel>Style</FieldLabel>
                <div className="grid gap-2 mt-1">
                  {styles.map((s) => (
                    <OptionCard
                      key={s.id}
                      variant="radio"
                      label={s.label}
                      description={s.body}
                      selected={hydrated && draft.style === s.id}
                      onToggle={() => canEdit && update({ style: s.id })}
                    />
                  ))}
                </div>
              </div>
              <div>
                <FieldLabel>Personality</FieldLabel>
                <div className="grid gap-2 mt-1">
                  {PERSONALITY_OPTIONS.map((p) => (
                    <OptionCard
                      key={p.id}
                      variant="radio"
                      label={p.label}
                      description={p.body}
                      selected={hydrated && draft.personality === p.id}
                      onToggle={() => canEdit && update({ personality: p.id })}
                    />
                  ))}
                </div>
              </div>
            </div>
          </Section>

          {/* Business hours — operational detail (not in the onboarding
              wizard). Persisted to vendors.hours on Save. */}
          <Section
            title="Business hours"
            className="lg:col-span-2"
            right={
              <button
                type="button"
                disabled={!canEdit}
                onClick={() => {
                  const monday = draft.hours.mon
                  const next = { ...draft.hours }
                  ;(['tue', 'wed', 'thu', 'fri'] as const).forEach((k) => {
                    next[k] = { ...monday }
                  })
                  update({ hours: next })
                }}
                className="text-xs font-semibold text-gray-600 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
              >
                Copy Mon to weekdays
              </button>
            }
          >
            <div className="divide-y divide-gray-100">
              {DAYS.map((d) => (
                <DayRow
                  key={d.key}
                  label={d.label}
                  short={d.short}
                  value={
                    hydrated
                      ? draft.hours[d.key]
                      : { open: false, from: '09:00', to: '18:00' }
                  }
                  disabled={!canEdit}
                  onChange={(patch) => updateDay(d.key, patch)}
                />
              ))}
            </div>
          </Section>
        </div>
      </div>

      {/* Sticky save bar */}
      <div className="sticky bottom-0 border-t border-gray-100 bg-white/95 backdrop-blur z-30">
        <div className="px-6 lg:px-10 py-3 flex items-center justify-between gap-4">
          <div className="text-xs flex items-center gap-3">
            {feedback ? (
              feedback.kind === 'success' ? (
                <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold">
                  <Check className="w-4 h-4" /> {feedback.message}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-rose-700 font-semibold">
                  <AlertCircle className="w-4 h-4" /> {feedback.message}
                </span>
              )
            ) : isDirty ? (
              <span className="text-amber-700 font-semibold">
                You have unsaved changes.
              </span>
            ) : (
              <span className="text-gray-500">
                Everything on this page saves to your storefront when you click
                Save.
              </span>
            )}
            {!canEdit && source.kind === 'live' ? (
              <span className="text-gray-400">
                Read-only — owner or manager role can edit.
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saveDisabled}
              className="inline-flex items-center gap-2 bg-white border border-gray-300 text-gray-900 text-sm font-semibold px-4 py-2 rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              {pending ? 'Saving…' : 'Save changes'}
            </button>
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

// The subset of OnboardingDraft this editor actually saves. We snapshot
// it on hydration + after every save so the Save button can light up
// when only these fields change.
function snapshotDraft(draft: {
  hours: unknown
  style: string | null
  personality: string | null
  serviceMarkets: string[]
  languages: string[]
}) {
  return JSON.stringify({
    hours: draft.hours,
    style: draft.style,
    personality: draft.personality,
    serviceMarkets: draft.serviceMarkets,
    languages: draft.languages,
  })
}

function draftsEqual(a: string, b: string): boolean {
  return a === b
}

function DraftBadge() {
  return (
    <span
      className="ml-1.5 inline-block bg-amber-100 text-amber-800 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
      title="Still on local draft — saves on this device only"
    >
      draft
    </span>
  )
}

function Section({
  title,
  hint,
  right,
  className,
  children,
}: {
  title?: string
  hint?: string
  right?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <section
      className={`bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-6 lg:p-7 ${className ?? ''}`}
    >
      {title ? (
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-gray-900 tracking-tight">
              {title}
            </h2>
            {hint ? (
              <p className="text-xs text-gray-500 mt-0.5">{hint}</p>
            ) : null}
          </div>
          {right ? <div className="shrink-0">{right}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  )
}

function DayRow({
  label,
  short,
  value,
  disabled,
  onChange,
}: {
  label: string
  short: string
  value: DayHours
  disabled?: boolean
  onChange: (patch: Partial<DayHours>) => void
}) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <label
        className="flex items-center gap-2.5 cursor-pointer w-20 shrink-0 select-none"
        title={label}
      >
        <input
          type="checkbox"
          checked={value.open}
          onChange={(e) => onChange({ open: e.target.checked })}
          disabled={disabled}
          className="w-4 h-4 accent-gray-900"
        />
        <span className="text-sm font-semibold text-gray-900">{short}</span>
      </label>
      {value.open ? (
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <input
            type="time"
            value={value.from}
            onChange={(e) => onChange({ from: e.target.value })}
            disabled={disabled}
            className="flex-1 min-w-0 bg-white border border-gray-300 rounded-md px-2 py-1.5 text-sm text-gray-900 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 disabled:bg-gray-50 disabled:cursor-not-allowed outline-none"
          />
          <span className="text-gray-400 text-xs shrink-0">–</span>
          <input
            type="time"
            value={value.to}
            onChange={(e) => onChange({ to: e.target.value })}
            disabled={disabled}
            className="flex-1 min-w-0 bg-white border border-gray-300 rounded-md px-2 py-1.5 text-sm text-gray-900 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 disabled:bg-gray-50 disabled:cursor-not-allowed outline-none"
          />
        </div>
      ) : (
        <span className="text-sm text-gray-400 italic">Closed</span>
      )}
    </div>
  )
}

function SocialRow({
  icon,
  label,
  placeholder,
  value,
  onChange,
  disabled,
}: {
  icon: React.ReactNode
  label: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  disabled?: boolean
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-9 h-9 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center shrink-0">
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-900 mb-1">{label}</p>
        <TextInput
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
      </div>
    </div>
  )
}
