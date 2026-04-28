'use client'

import { useEffect, useMemo, useState } from 'react'
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
import { getStorefrontSections } from '@/lib/storefront/completion'
import {
  formatRelativeSaved,
  validateProfile,
  type ProfileErrors,
} from '@/lib/storefront/validation'

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

export default function ListingAboutPage() {
  const router = useRouter()
  const { draft, update, hydrated } = useOnboardingDraft()
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const [errors, setErrors] = useState<ProfileErrors>({})
  const [saveTick, setSaveTick] = useState(0)

  // The Next button advances to the section that follows "Profile" in the
  // storefront sidebar order, so reordering sections in completion.ts also
  // reorders the flow without further changes here.
  const nextHref = useMemo(() => {
    const sections = getStorefrontSections(draft)
    const idx = sections.findIndex((s) => s.id === 'about')
    return idx >= 0 && idx < sections.length - 1 ? sections[idx + 1].href : null
  }, [draft])

  // Re-render the relative timestamp ("Saved 2 minutes ago") every 30s.
  useEffect(() => {
    if (!savedAt) return
    const id = setInterval(() => setSaveTick((n) => n + 1), 30_000)
    return () => clearInterval(id)
  }, [savedAt])

  // When a user fixes a field, clear its error in real-time. The full
  // validation only re-runs on Save, but this gives instant feedback.
  useEffect(() => {
    if (Object.keys(errors).length === 0) return
    const next = validateProfile(draft)
    const cleared: ProfileErrors = {}
    for (const key of Object.keys(errors) as Array<keyof ProfileErrors>) {
      if (next[key]) cleared[key] = next[key]
    }
    if (Object.keys(cleared).length !== Object.keys(errors).length) {
      setErrors(cleared)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft])

  const onNext = () => {
    const validationErrors = validateProfile(draft)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) {
      // Scroll the first invalid field into view so the user sees what's wrong.
      const firstError = Object.keys(validationErrors)[0]
      requestAnimationFrame(() => {
        const el = document.querySelector<HTMLElement>(
          `[data-field="${firstError}"]`,
        )
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        el?.focus({ preventScroll: true })
      })
      return
    }
    setSavedAt(new Date())
    if (nextHref) router.push(nextHref)
  }

  const errorCount = Object.keys(errors).length
  const savedLabel = useMemo(
    () => formatRelativeSaved(savedAt),
    // saveTick is intentional — drives the re-render every 30s.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [savedAt, saveTick],
  )

  const toggleLanguage = (id: string) => {
    const set = new Set(draft.languages)
    if (set.has(id)) set.delete(id)
    else set.add(id)
    update({ languages: Array.from(set) })
  }

  const toggleServiceMarket = (id: string) => {
    if (id === homeMarket) return // home market is always on, not toggleable
    const set = new Set(draft.serviceMarkets)
    if (set.has(id)) set.delete(id)
    else set.add(id)
    update({ serviceMarkets: Array.from(set) })
  }

  const styles = getStylesForCategory(draft.categoryId)
  const homeMarket = homeMarketForRegion(draft.region)

  const updateDay = (key: DayKey, patch: Partial<DayHours>) => {
    update({ hours: { ...draft.hours, [key]: { ...draft.hours[key], ...patch } } })
  }

  const updateSocial = (key: keyof typeof draft.socials, value: string) => {
    update({ socials: { ...draft.socials, [key]: value } })
  }

  if (!hydrated) {
    return <div className="p-8" aria-hidden />
  }

  const bioLength = draft.bio.trim().length
  const bioHint =
    bioLength === 0
      ? `Min ${MIN_BIO} characters.`
      : bioLength < MIN_BIO
        ? `${MIN_BIO - bioLength} more character${MIN_BIO - bioLength === 1 ? '' : 's'} to go (min ${MIN_BIO}).`
        : `${bioLength} characters — looking good.`

  const homeMarketName = SERVICE_MARKETS.find((m) => m.id === homeMarket)?.name
  const extraMarkets = SERVICE_MARKETS.filter((m) => m.id !== homeMarket)

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex-1 px-6 lg:px-10 pt-4 lg:pt-5 pb-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Identity — Owner & business */}
        <Section
          title="Owner & business"
          hint="Who runs the storefront and how the business is registered."
          className="lg:col-span-2"
        >
          <div className="space-y-4">
            <div data-field="businessName">
              <FieldLabel required>Business name</FieldLabel>
              <TextInput
                value={draft.businessName}
                onChange={(e) => update({ businessName: e.target.value })}
                autoComplete="organization"
                placeholder="e.g. Festa Films"
                error={errors.businessName}
              />
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div data-field="firstName">
                <FieldLabel required>First name</FieldLabel>
                <TextInput
                  value={draft.firstName}
                  onChange={(e) => update({ firstName: e.target.value })}
                  autoComplete="given-name"
                  error={errors.firstName}
                />
              </div>
              <div data-field="lastName">
                <FieldLabel required>Last name</FieldLabel>
                <TextInput
                  value={draft.lastName}
                  onChange={(e) => update({ lastName: e.target.value })}
                  autoComplete="family-name"
                  error={errors.lastName}
                />
              </div>
              <div>
                <FieldLabel>Years in business</FieldLabel>
                <TextInput
                  inputMode="numeric"
                  value={draft.yearsInBusiness}
                  onChange={(e) =>
                    update({
                      yearsInBusiness: e.target.value.replace(/[^\d]/g, '').slice(0, 2),
                    })
                  }
                  placeholder="e.g. 5"
                />
              </div>
            </div>
          </div>
        </Section>

        {/* 2. Where you're based — Address */}
        <Section
          title="Business address"
          hint="Only your city and region appear publicly. Full address stays private."
          className="lg:col-span-2"
        >
          <div className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2" data-field="street">
                <FieldLabel required>Street address</FieldLabel>
                <TextInput
                  placeholder="Address"
                  value={draft.street}
                  onChange={(e) => update({ street: e.target.value })}
                  autoComplete="address-line1"
                  error={errors.street}
                />
              </div>
              <div>
                <FieldLabel>Apartment, suite, plot</FieldLabel>
                <TextInput
                  placeholder="Optional"
                  value={draft.street2}
                  onChange={(e) => update({ street2: e.target.value })}
                  autoComplete="address-line2"
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div data-field="city">
                <FieldLabel required>City / Town</FieldLabel>
                <TextInput
                  placeholder="e.g. Dar es Salaam"
                  value={draft.city}
                  onChange={(e) => update({ city: e.target.value })}
                  autoComplete="address-level2"
                  error={errors.city}
                />
              </div>
              <div data-field="region">
                <FieldLabel required>Region</FieldLabel>
                <SelectInput
                  placeholder="Region"
                  value={draft.region}
                  onChange={(e) => update({ region: e.target.value })}
                  error={errors.region}
                >
                  {TZ_REGIONS.map((r) => (
                    <option key={r.code} value={r.code}>
                      {r.name}
                    </option>
                  ))}
                </SelectInput>
              </div>
              <div>
                <FieldLabel>Postal code</FieldLabel>
                <TextInput
                  placeholder="e.g. 11101"
                  value={draft.postalCode}
                  onChange={(e) => update({ postalCode: e.target.value })}
                  autoComplete="postal-code"
                />
              </div>
            </div>
          </div>
        </Section>

        {/* 3. Story — Bio */}
        <Section
          title="Bio"
          hint="What couples read first on your storefront."
          className="lg:col-span-2"
        >
          <div className="space-y-5">
            <div data-field="bio">
              <FieldLabel required>Description</FieldLabel>
              <TextArea
                value={draft.bio}
                onChange={(e) => update({ bio: e.target.value })}
                rows={6}
                hint={bioHint}
                error={errors.bio}
              />
            </div>
            <div>
              <FieldLabel>Languages spoken with clients</FieldLabel>
              <div className="grid sm:grid-cols-3 lg:grid-cols-4 gap-2 mt-1">
                {LANGUAGES.map((lang) => (
                  <OptionCard
                    key={lang.id}
                    variant="checkbox"
                    label={lang.label}
                    selected={draft.languages.includes(lang.id)}
                    onToggle={() => toggleLanguage(lang.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* 4. Vibe — Style & personality */}
        <Section
          title="Style & personality"
          hint="Couples filter vendors by style — pick whichever matches your work most."
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
                    selected={draft.style === s.id}
                    onToggle={() => update({ style: s.id })}
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
                    selected={draft.personality === p.id}
                    onToggle={() => update({ personality: p.id })}
                  />
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* 5. Where you serve — Service area */}
        <Section
          title="Service area"
          hint="Markets where you’ll travel for your standard fee. Add or remove anytime."
          className="lg:col-span-2"
        >
          {/* Home market — pinned at top */}
          <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 flex items-center gap-3 mb-5">
            <span className="w-7 h-7 rounded-lg bg-gray-900 text-white flex items-center justify-center shrink-0">
              <MapPin className="w-3.5 h-3.5" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">
                {homeMarketName ?? 'Home market not set'}
              </p>
              <p className="text-xs text-gray-500">
                Home market — auto-set from your region above.
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
                selected={draft.serviceMarkets.includes(m.id)}
                onToggle={() => toggleServiceMarket(m.id)}
              />
            ))}
          </div>
        </Section>

        {/* 6. When + how to reach you — Hours + Contact paired */}
        <Section
          title="Business hours"
          hint="When can couples reach you for inquiries?"
          right={
            <button
              type="button"
              onClick={() => {
                const monday = draft.hours.mon
                const next = { ...draft.hours }
                ;(['tue', 'wed', 'thu', 'fri'] as const).forEach((k) => {
                  next[k] = { ...monday }
                })
                update({ hours: next })
              }}
              className="text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors"
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
                value={draft.hours[d.key]}
                onChange={(patch) => updateDay(d.key, patch)}
              />
            ))}
          </div>
        </Section>

        <Section
          title="Contact details"
          hint="Shared with couples after booking, not on your public storefront."
        >
          <div className="space-y-4">
            <div data-field="phone">
              <FieldLabel>Business phone</FieldLabel>
              <TextInput
                prefix="+255"
                inputMode="tel"
                value={draft.phone}
                onChange={(e) => update({ phone: e.target.value.replace(/[^\d\s]/g, '') })}
                error={errors.phone}
              />
            </div>
            <div data-field="whatsapp">
              <FieldLabel>WhatsApp number</FieldLabel>
              <TextInput
                prefix="+255"
                inputMode="tel"
                value={draft.whatsapp}
                onChange={(e) => update({ whatsapp: e.target.value.replace(/[^\d\s]/g, '') })}
                error={errors.whatsapp}
              />
            </div>
            <div data-field="email">
              <FieldLabel>Business email</FieldLabel>
              <TextInput
                type="email"
                inputMode="email"
                placeholder="hello@yourbusiness.co.tz"
                value={draft.email}
                onChange={(e) => update({ email: e.target.value })}
                error={errors.email}
              />
            </div>
          </div>
        </Section>

        {/* 7. Public discovery — Socials */}
        <Section
          title="Social media & website"
          hint="Optional — helps couples explore your work."
          className="lg:col-span-2"
        >
          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
            <SocialRow
              icon={<Globe className="w-4 h-4" />}
              label="Website"
              placeholder="https://yourstudio.co.tz"
              value={draft.socials.website}
              onChange={(v) => updateSocial('website', v)}
            />
            <SocialRow
              icon={<MessageCircle className="w-4 h-4" />}
              label="WhatsApp Business"
              placeholder="+255 754 123 456"
              value={draft.socials.whatsapp}
              onChange={(v) => updateSocial('whatsapp', v)}
            />
            <SocialRow
              icon={<Instagram className="w-4 h-4" />}
              label="Instagram"
              placeholder="@yourstudio"
              value={draft.socials.instagram}
              onChange={(v) => updateSocial('instagram', v)}
            />
            <SocialRow
              icon={<Facebook className="w-4 h-4" />}
              label="Facebook"
              placeholder="facebook.com/yourstudio"
              value={draft.socials.facebook}
              onChange={(v) => updateSocial('facebook', v)}
            />
            <SocialRow
              icon={<Music className="w-4 h-4" />}
              label="TikTok"
              placeholder="@yourstudio"
              value={draft.socials.tiktok}
              onChange={(v) => updateSocial('tiktok', v)}
            />
          </div>
        </Section>
      </div>
      </div>

      {/* Sticky save bar — sits inside content column, spans its width */}
      <div className="sticky bottom-0 border-t border-gray-100 bg-white/95 backdrop-blur z-30">
        <div className="px-6 lg:px-10 py-3 flex items-center justify-between gap-4">
          <p className="text-xs">
            {errorCount > 0 ? (
              <span className="inline-flex items-center gap-1.5 text-rose-700 font-semibold">
                <AlertCircle className="w-4 h-4" />
                {errorCount} field{errorCount === 1 ? '' : 's'} need
                {errorCount === 1 ? 's' : ''} attention
              </span>
            ) : savedLabel ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold">
                <Check className="w-4 h-4" /> {savedLabel}
              </span>
            ) : (
              <span className="text-gray-500">Changes save automatically as you type.</span>
            )}
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
            <h2 className="text-base font-semibold text-gray-900 tracking-tight">{title}</h2>
            {hint ? <p className="text-xs text-gray-500 mt-0.5">{hint}</p> : null}
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
  onChange,
}: {
  label: string
  short: string
  value: DayHours
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
            className="flex-1 min-w-0 bg-white border border-gray-300 rounded-md px-2 py-1.5 text-sm text-gray-900 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none"
          />
          <span className="text-gray-400 text-xs shrink-0">–</span>
          <input
            type="time"
            value={value.to}
            onChange={(e) => onChange({ to: e.target.value })}
            className="flex-1 min-w-0 bg-white border border-gray-300 rounded-md px-2 py-1.5 text-sm text-gray-900 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none"
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
}: {
  icon: React.ReactNode
  label: string
  placeholder: string
  value: string
  onChange: (v: string) => void
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
        />
      </div>
    </div>
  )
}
