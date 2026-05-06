'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition, type ReactNode } from 'react'
import {
  AlertCircle,
  Building2,
  Calendar,
  Check,
  ClipboardList,
  HelpCircle,
  Plus,
  Star,
  Trash2,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { updateStorefrontSection, type StorefrontPatch } from '../actions'

// ---------------------------------------------------------------------------
// Shared primitives — keeps the per-section editors compact
// ---------------------------------------------------------------------------

const inputCls =
  'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7E5896]/30 focus:border-[#7E5896]/40'

function Card({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: ReactNode
  title: string
  subtitle?: string
  children: ReactNode
}) {
  return (
    <article className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-6">
      <header className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-white border border-gray-200 text-gray-500 flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
          )}
        </div>
      </header>
      {children}
    </article>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
        {label}
      </label>
      {children}
    </div>
  )
}

function SaveBar({
  pending,
  dirty,
  error,
  saved,
  onSave,
  cta = 'Save',
}: {
  pending: boolean
  dirty: boolean
  error: string | null
  saved: boolean
  onSave: () => void
  cta?: string
}) {
  return (
    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-3 flex-wrap">
      <div className="text-xs">
        {error && <span className="text-rose-700">{error}</span>}
        {saved && !error && <span className="text-emerald-700">Saved.</span>}
      </div>
      <button
        type="button"
        onClick={onSave}
        disabled={pending || !dirty}
        className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full bg-gray-900 hover:bg-black text-white disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {pending ? 'Saving…' : cta}
      </button>
    </div>
  )
}

function newId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `id-${Math.random().toString(36).slice(2, 10)}`
}

// useStorefrontSave — boilerplate the editors share. Wraps the server action,
// handles transitions, and refreshes the route on success.
function useStorefrontSave(vendorId: string) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const save = (patch: StorefrontPatch, after?: () => void) => {
    setError(null)
    setSaved(false)
    startTransition(async () => {
      const res = await updateStorefrontSection(vendorId, patch)
      if (!res.ok) {
        setError(res.error)
        return
      }
      setSaved(true)
      after?.()
      router.refresh()
    })
  }
  return { pending, error, saved, save }
}

// ---------------------------------------------------------------------------
// 1. Profile + contact + socials
// ---------------------------------------------------------------------------

export type ProfileInitial = {
  businessName: string
  bio: string
  yearsInBusiness: number | null
  street: string
  street2: string
  city: string
  region: string
  postalCode: string
  phone: string
  email: string
  whatsapp: string
  socialWebsite: string
  socialInstagram: string
  socialFacebook: string
  socialTiktok: string
  socialWhatsapp: string
}

export function AdminProfileEditor({
  vendorId,
  initial,
}: {
  vendorId: string
  initial: ProfileInitial
}) {
  const [v, setV] = useState(initial)
  const dirty = JSON.stringify(v) !== JSON.stringify(initial)
  const { pending, error, saved, save } = useStorefrontSave(vendorId)

  const onSave = () =>
    save({
      businessName: v.businessName,
      bio: v.bio,
      yearsInBusiness:
        v.yearsInBusiness === null || Number.isNaN(v.yearsInBusiness)
          ? null
          : v.yearsInBusiness,
      street: v.street,
      street2: v.street2,
      city: v.city,
      region: v.region,
      postalCode: v.postalCode,
      phone: v.phone,
      email: v.email,
      whatsapp: v.whatsapp,
      socialWebsite: v.socialWebsite,
      socialInstagram: v.socialInstagram,
      socialFacebook: v.socialFacebook,
      socialTiktok: v.socialTiktok,
      socialWhatsapp: v.socialWhatsapp,
    })

  return (
    <Card
      icon={<Building2 className="w-5 h-5" strokeWidth={1.75} />}
      title="Business profile & contact"
      subtitle="Public business details, location, phone, email, WhatsApp, and social links."
    >
      <div className="flex flex-col gap-3">
        <Field label="Business name">
          <input
            className={inputCls}
            value={v.businessName}
            onChange={(e) => setV({ ...v, businessName: e.target.value })}
          />
        </Field>
        <Field label="Years in business">
          <input
            type="number"
            min={0}
            className={inputCls}
            value={v.yearsInBusiness ?? ''}
            onChange={(e) =>
              setV({
                ...v,
                yearsInBusiness:
                  e.target.value === '' ? null : Number(e.target.value),
              })
            }
          />
        </Field>
      </div>
      <div className="mt-3">
        <Field label="Bio">
          <textarea
            rows={4}
            className={inputCls}
            value={v.bio}
            onChange={(e) => setV({ ...v, bio: e.target.value })}
          />
        </Field>
      </div>

      <div className="mt-5 pt-4 border-t border-gray-100">
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
          Address
        </p>
        <div className="flex flex-col gap-3">
          <Field label="Street">
            <input
              className={inputCls}
              value={v.street}
              onChange={(e) => setV({ ...v, street: e.target.value })}
            />
          </Field>
          <Field label="Apt / suite / plot">
            <input
              className={inputCls}
              value={v.street2}
              onChange={(e) => setV({ ...v, street2: e.target.value })}
            />
          </Field>
          <Field label="City / town">
            <input
              className={inputCls}
              value={v.city}
              onChange={(e) => setV({ ...v, city: e.target.value })}
            />
          </Field>
          <Field label="Region">
            <input
              className={inputCls}
              value={v.region}
              onChange={(e) => setV({ ...v, region: e.target.value })}
            />
          </Field>
          <Field label="Postal code">
            <input
              className={inputCls}
              value={v.postalCode}
              onChange={(e) => setV({ ...v, postalCode: e.target.value })}
            />
          </Field>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-gray-100">
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
          Contact
        </p>
        <div className="flex flex-col gap-3">
          <Field label="Phone">
            <input
              className={inputCls}
              value={v.phone}
              onChange={(e) => setV({ ...v, phone: e.target.value })}
            />
          </Field>
          <Field label="WhatsApp">
            <input
              className={inputCls}
              value={v.whatsapp}
              onChange={(e) => setV({ ...v, whatsapp: e.target.value })}
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              className={inputCls}
              value={v.email}
              onChange={(e) => setV({ ...v, email: e.target.value })}
            />
          </Field>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-gray-100">
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
          Social media & website
        </p>
        <div className="flex flex-col gap-3">
          <Field label="Website">
            <input
              className={inputCls}
              value={v.socialWebsite}
              onChange={(e) => setV({ ...v, socialWebsite: e.target.value })}
              placeholder="https://"
            />
          </Field>
          <Field label="WhatsApp business">
            <input
              className={inputCls}
              value={v.socialWhatsapp}
              onChange={(e) => setV({ ...v, socialWhatsapp: e.target.value })}
            />
          </Field>
          <Field label="Instagram">
            <input
              className={inputCls}
              value={v.socialInstagram}
              onChange={(e) => setV({ ...v, socialInstagram: e.target.value })}
              placeholder="@handle"
            />
          </Field>
          <Field label="Facebook">
            <input
              className={inputCls}
              value={v.socialFacebook}
              onChange={(e) => setV({ ...v, socialFacebook: e.target.value })}
            />
          </Field>
          <Field label="TikTok">
            <input
              className={inputCls}
              value={v.socialTiktok}
              onChange={(e) => setV({ ...v, socialTiktok: e.target.value })}
              placeholder="@handle"
            />
          </Field>
        </div>
      </div>

      <SaveBar
        pending={pending}
        dirty={dirty}
        error={error}
        saved={saved}
        onSave={onSave}
      />
    </Card>
  )
}

// ---------------------------------------------------------------------------
// 2. Style, personality, languages
// ---------------------------------------------------------------------------

const STYLE_OPTIONS = [
  'modern',
  'traditional',
  'fusion',
  'luxury',
  'rustic',
  'minimal',
  'cinematic',
  'editorial',
]
const PERSONALITY_OPTIONS = [
  'decisive',
  'easygoing',
  'serene',
  'lively',
  'meticulous',
  'warm',
]
const LANGUAGE_OPTIONS = [
  { id: 'en', label: 'English' },
  { id: 'sw', label: 'Swahili' },
  { id: 'fr', label: 'French' },
]

export function AdminStylePersonalityEditor({
  vendorId,
  initial,
}: {
  vendorId: string
  initial: {
    style: string | null
    personality: string | null
    languages: string[]
  }
}) {
  const [style, setStyle] = useState<string | null>(initial.style)
  const [personality, setPersonality] = useState<string | null>(
    initial.personality
  )
  const [languages, setLanguages] = useState<string[]>(initial.languages)
  const dirty =
    style !== initial.style ||
    personality !== initial.personality ||
    JSON.stringify(languages) !== JSON.stringify(initial.languages)
  const { pending, error, saved, save } = useStorefrontSave(vendorId)

  const toggleLang = (id: string) =>
    setLanguages((cur) =>
      cur.includes(id) ? cur.filter((l) => l !== id) : [...cur, id]
    )

  return (
    <Card
      icon={<Star className="w-5 h-5" strokeWidth={1.75} />}
      title="Style, personality & languages"
      subtitle="How this vendor is categorized and filtered on the marketplace."
    >
      <div className="flex flex-col gap-3">
        <Field label="Style">
          <select
            className={inputCls}
            value={style ?? ''}
            onChange={(e) => setStyle(e.target.value || null)}
          >
            <option value="">—</option>
            {STYLE_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s[0].toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Personality">
          <select
            className={inputCls}
            value={personality ?? ''}
            onChange={(e) => setPersonality(e.target.value || null)}
          >
            <option value="">—</option>
            {PERSONALITY_OPTIONS.map((p) => (
              <option key={p} value={p}>
                {p[0].toUpperCase() + p.slice(1)}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div className="mt-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
          Languages
        </p>
        <div className="flex flex-wrap gap-1.5">
          {LANGUAGE_OPTIONS.map((l) => {
            const on = languages.includes(l.id)
            return (
              <button
                key={l.id}
                type="button"
                onClick={() => toggleLang(l.id)}
                className={cn(
                  'inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors',
                  on
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                )}
              >
                {on && <Check className="w-3 h-3" strokeWidth={3} />}
                {l.label}
              </button>
            )
          })}
        </div>
      </div>
      <SaveBar
        pending={pending}
        dirty={dirty}
        error={error}
        saved={saved}
        onSave={() => save({ style, personality, languages })}
      />
    </Card>
  )
}

// ---------------------------------------------------------------------------
// 3. Business hours
// ---------------------------------------------------------------------------

const DAYS: Array<{
  key: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'
  label: string
}> = [
  { key: 'mon', label: 'Mon' },
  { key: 'tue', label: 'Tue' },
  { key: 'wed', label: 'Wed' },
  { key: 'thu', label: 'Thu' },
  { key: 'fri', label: 'Fri' },
  { key: 'sat', label: 'Sat' },
  { key: 'sun', label: 'Sun' },
]

type DayHours = { open: boolean; from: string; to: string }
type HoursMap = Record<(typeof DAYS)[number]['key'], DayHours>

const DEFAULT_HOURS: HoursMap = {
  mon: { open: true, from: '09:00', to: '18:00' },
  tue: { open: true, from: '09:00', to: '18:00' },
  wed: { open: true, from: '09:00', to: '18:00' },
  thu: { open: true, from: '09:00', to: '18:00' },
  fri: { open: true, from: '09:00', to: '18:00' },
  sat: { open: true, from: '10:00', to: '20:00' },
  sun: { open: false, from: '09:00', to: '18:00' },
}

export function AdminHoursEditor({
  vendorId,
  initial,
}: {
  vendorId: string
  initial: HoursMap | null
}) {
  const seed = initial ?? DEFAULT_HOURS
  const [hours, setHours] = useState<HoursMap>(seed)
  const dirty = JSON.stringify(hours) !== JSON.stringify(seed)
  const { pending, error, saved, save } = useStorefrontSave(vendorId)

  return (
    <Card
      icon={<Calendar className="w-5 h-5" strokeWidth={1.75} />}
      title="Business hours"
      subtitle="Weekly availability shown on the public storefront."
    >
      <ul className="rounded-xl border border-gray-200 overflow-hidden divide-y divide-gray-100 bg-white">
        {DAYS.map(({ key, label }) => {
          const day = hours[key]
          return (
            <li
              key={key}
              className="flex items-center gap-3 px-4 py-2.5 text-sm flex-wrap"
            >
              <label className="inline-flex items-center gap-2 w-20 shrink-0">
                <input
                  type="checkbox"
                  checked={day.open}
                  onChange={(e) =>
                    setHours({
                      ...hours,
                      [key]: { ...day, open: e.target.checked },
                    })
                  }
                />
                <span className="font-semibold text-gray-700">{label}</span>
              </label>
              <input
                type="time"
                value={day.from}
                disabled={!day.open}
                onChange={(e) =>
                  setHours({
                    ...hours,
                    [key]: { ...day, from: e.target.value },
                  })
                }
                className="px-2 py-1 border border-gray-300 rounded text-sm font-mono disabled:bg-gray-50 disabled:text-gray-400"
              />
              <span className="text-gray-400">–</span>
              <input
                type="time"
                value={day.to}
                disabled={!day.open}
                onChange={(e) =>
                  setHours({ ...hours, [key]: { ...day, to: e.target.value } })
                }
                className="px-2 py-1 border border-gray-300 rounded text-sm font-mono disabled:bg-gray-50 disabled:text-gray-400"
              />
              {!day.open && (
                <span className="text-xs text-gray-400 italic ml-2">
                  Closed
                </span>
              )}
            </li>
          )
        })}
      </ul>
      <SaveBar
        pending={pending}
        dirty={dirty}
        error={error}
        saved={saved}
        onSave={() => save({ hours })}
      />
    </Card>
  )
}

// ---------------------------------------------------------------------------
// 4. Booking policies
// ---------------------------------------------------------------------------

export function AdminBookingPoliciesEditor({
  vendorId,
  initial,
}: {
  vendorId: string
  initial: {
    depositPercent: string | null
    cancellationLevel: string | null
    reschedulePolicy: string | null
    parallelBookingCapacity: number | null
  }
}) {
  const [v, setV] = useState(initial)
  const dirty = JSON.stringify(v) !== JSON.stringify(initial)
  const { pending, error, saved, save } = useStorefrontSave(vendorId)

  return (
    <Card
      icon={<ClipboardList className="w-5 h-5" strokeWidth={1.75} />}
      title="Booking policies"
      subtitle="Deposit, cancellation, rescheduling, and daily booking capacity."
    >
      <div className="flex flex-col gap-3">
        <Field label="Deposit (%)">
          <input
            type="number"
            min={0}
            max={100}
            className={inputCls}
            value={v.depositPercent ?? ''}
            onChange={(e) =>
              setV({ ...v, depositPercent: e.target.value || null })
            }
          />
        </Field>
        <Field label="Parallel bookings/day">
          <input
            type="number"
            min={1}
            className={inputCls}
            value={v.parallelBookingCapacity ?? ''}
            onChange={(e) =>
              setV({
                ...v,
                parallelBookingCapacity:
                  e.target.value === '' ? null : Number(e.target.value),
              })
            }
          />
        </Field>
        <Field label="Cancellation policy">
          <select
            className={inputCls}
            value={v.cancellationLevel ?? ''}
            onChange={(e) =>
              setV({ ...v, cancellationLevel: e.target.value || null })
            }
          >
            <option value="">—</option>
            <option value="flexible">Flexible</option>
            <option value="moderate">Moderate</option>
            <option value="strict">Strict</option>
          </select>
        </Field>
        <Field label="Reschedule policy">
          <select
            className={inputCls}
            value={v.reschedulePolicy ?? ''}
            onChange={(e) =>
              setV({ ...v, reschedulePolicy: e.target.value || null })
            }
          >
            <option value="">—</option>
            <option value="one-free">One free reschedule</option>
            <option value="unlimited">Unlimited reschedules</option>
            <option value="none">No reschedules</option>
          </select>
        </Field>
      </div>
      <SaveBar
        pending={pending}
        dirty={dirty}
        error={error}
        saved={saved}
        onSave={() =>
          save({
            depositPercent: v.depositPercent,
            cancellationLevel: v.cancellationLevel,
            reschedulePolicy: v.reschedulePolicy,
            parallelBookingCapacity: v.parallelBookingCapacity,
          })
        }
      />
    </Card>
  )
}

// ---------------------------------------------------------------------------
// 5. Recognition (awards text + response time + locally owned)
// ---------------------------------------------------------------------------

export function AdminRecognitionEditor({
  vendorId,
  initial,
}: {
  vendorId: string
  initial: {
    awards: string | null
    responseTimeHours: string | null
    locallyOwned: boolean | null
  }
}) {
  const [v, setV] = useState(initial)
  const dirty = JSON.stringify(v) !== JSON.stringify(initial)
  const { pending, error, saved, save } = useStorefrontSave(vendorId)

  return (
    <Card
      icon={<AlertCircle className="w-5 h-5" strokeWidth={1.75} />}
      title="Recognition"
      subtitle="Awards, response expectations, and local ownership signals."
    >
      <Field label="Awards & recognition (free text)">
        <textarea
          rows={4}
          className={inputCls}
          value={v.awards ?? ''}
          onChange={(e) => setV({ ...v, awards: e.target.value || null })}
          placeholder="e.g. Best Wedding Venue 2024 — Tanzania Hospitality Awards"
        />
      </Field>
      <div className="flex flex-col gap-3 mt-3">
        <Field label="Typical response time">
          <input
            className={inputCls}
            value={v.responseTimeHours ?? ''}
            onChange={(e) =>
              setV({ ...v, responseTimeHours: e.target.value || null })
            }
            placeholder="e.g. 4 hours"
          />
        </Field>
        <Field label="Locally owned">
          <label className="inline-flex items-center gap-2 mt-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={v.locallyOwned ?? false}
              onChange={(e) => setV({ ...v, locallyOwned: e.target.checked })}
            />
            Tanzanian-owned & operated
          </label>
        </Field>
      </div>
      <SaveBar
        pending={pending}
        dirty={dirty}
        error={error}
        saved={saved}
        onSave={() =>
          save({
            awards: v.awards,
            responseTimeHours: v.responseTimeHours,
            locallyOwned: v.locallyOwned,
          })
        }
      />
    </Card>
  )
}

// ---------------------------------------------------------------------------
// 6. Team CRUD
// ---------------------------------------------------------------------------

type TeamMember = { id: string; name: string; role: string; bio: string }

export function AdminTeamEditor({
  vendorId,
  initial,
}: {
  vendorId: string
  initial: TeamMember[]
}) {
  const [team, setTeam] = useState<TeamMember[]>(initial)
  const dirty = JSON.stringify(team) !== JSON.stringify(initial)
  const { pending, error, saved, save } = useStorefrontSave(vendorId)

  const add = () =>
    setTeam([...team, { id: newId(), name: '', role: '', bio: '' }])
  const update = (id: string, patch: Partial<TeamMember>) =>
    setTeam(team.map((m) => (m.id === id ? { ...m, ...patch } : m)))
  const remove = (id: string) => setTeam(team.filter((m) => m.id !== id))

  return (
    <Card
      icon={<Users className="w-5 h-5" strokeWidth={1.75} />}
      title="Team members"
      subtitle="People shown on the vendor storefront."
    >
      {team.length === 0 ? (
        <p className="text-sm text-gray-500 italic">No team members yet.</p>
      ) : (
        <ul className="space-y-3">
          {team.map((m) => (
            <li
              key={m.id}
              className="rounded-xl border border-gray-100 bg-gray-50 p-3"
            >
              <div className="flex flex-col gap-2">
                <Field label="Name">
                  <input
                    className={inputCls}
                    value={m.name}
                    onChange={(e) => update(m.id, { name: e.target.value })}
                  />
                </Field>
                <Field label="Role">
                  <input
                    className={inputCls}
                    value={m.role}
                    onChange={(e) => update(m.id, { role: e.target.value })}
                  />
                </Field>
              </div>
              <div className="mt-2">
                <Field label="Bio">
                  <textarea
                    rows={2}
                    className={inputCls}
                    value={m.bio}
                    onChange={(e) => update(m.id, { bio: e.target.value })}
                  />
                </Field>
              </div>
              <button
                type="button"
                onClick={() => remove(m.id)}
                className="mt-2 inline-flex items-center gap-1 text-xs text-rose-700 hover:text-rose-900 font-semibold"
              >
                <Trash2 className="w-3 h-3" /> Remove member
              </button>
            </li>
          ))}
        </ul>
      )}
      <button
        type="button"
        onClick={add}
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-gray-900"
      >
        <Plus className="w-3.5 h-3.5" /> Add team member
      </button>
      <SaveBar
        pending={pending}
        dirty={dirty}
        error={error}
        saved={saved}
        onSave={() =>
          save({
            team: team
              .filter((m) => m.name.trim() || m.role.trim())
              .map((m) => ({
                id: m.id,
                name: m.name.trim(),
                role: m.role.trim(),
                bio: m.bio.trim() || undefined,
              })),
          })
        }
      />
    </Card>
  )
}

// ---------------------------------------------------------------------------
// 7. FAQ CRUD
// ---------------------------------------------------------------------------

type Faq = { id: string; question: string; answer: string }

export function AdminFaqEditor({
  vendorId,
  initial,
}: {
  vendorId: string
  initial: Faq[]
}) {
  const [faqs, setFaqs] = useState<Faq[]>(initial)
  const dirty = JSON.stringify(faqs) !== JSON.stringify(initial)
  const { pending, error, saved, save } = useStorefrontSave(vendorId)

  const add = () =>
    setFaqs([...faqs, { id: newId(), question: '', answer: '' }])
  const update = (id: string, patch: Partial<Faq>) =>
    setFaqs(faqs.map((f) => (f.id === id ? { ...f, ...patch } : f)))
  const remove = (id: string) => setFaqs(faqs.filter((f) => f.id !== id))

  return (
    <Card
      icon={<HelpCircle className="w-5 h-5" strokeWidth={1.75} />}
      title="FAQs"
      subtitle="Questions and answers couples see before inquiring."
    >
      {faqs.length === 0 ? (
        <p className="text-sm text-gray-500 italic">No FAQs yet.</p>
      ) : (
        <ul className="space-y-3">
          {faqs.map((f) => (
            <li
              key={f.id}
              className="rounded-xl border border-gray-100 bg-gray-50 p-3"
            >
              <Field label="Question">
                <input
                  className={inputCls}
                  value={f.question}
                  onChange={(e) => update(f.id, { question: e.target.value })}
                />
              </Field>
              <div className="mt-2">
                <Field label="Answer">
                  <textarea
                    rows={2}
                    className={inputCls}
                    value={f.answer}
                    onChange={(e) => update(f.id, { answer: e.target.value })}
                  />
                </Field>
              </div>
              <button
                type="button"
                onClick={() => remove(f.id)}
                className="mt-2 inline-flex items-center gap-1 text-xs text-rose-700 hover:text-rose-900 font-semibold"
              >
                <Trash2 className="w-3 h-3" /> Remove
              </button>
            </li>
          ))}
        </ul>
      )}
      <button
        type="button"
        onClick={add}
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-gray-900"
      >
        <Plus className="w-3.5 h-3.5" /> Add FAQ
      </button>
      <SaveBar
        pending={pending}
        dirty={dirty}
        error={error}
        saved={saved}
        onSave={() =>
          save({
            faqs: faqs
              .filter((f) => f.question.trim() && f.answer.trim())
              .map((f) => ({
                id: f.id,
                question: f.question.trim(),
                answer: f.answer.trim(),
              })),
          })
        }
      />
    </Card>
  )
}

// ---------------------------------------------------------------------------
// 8. Packages CRUD
// ---------------------------------------------------------------------------

type Package = {
  id: string
  name: string
  price: string
  description: string
  includes: string
}

export function AdminPackagesEditor({
  vendorId,
  initial,
}: {
  vendorId: string
  initial: Package[]
}) {
  const [packages, setPackages] = useState<Package[]>(initial)
  const dirty = JSON.stringify(packages) !== JSON.stringify(initial)
  const { pending, error, saved, save } = useStorefrontSave(vendorId)

  const add = () =>
    setPackages([
      ...packages,
      { id: newId(), name: '', price: '', description: '', includes: '' },
    ])
  const update = (id: string, patch: Partial<Package>) =>
    setPackages(packages.map((p) => (p.id === id ? { ...p, ...patch } : p)))
  const remove = (id: string) =>
    setPackages(packages.filter((p) => p.id !== id))

  return (
    <Card
      icon={<Star className="w-5 h-5" strokeWidth={1.75} />}
      title="Packages & pricing"
      subtitle="Commercial packages, prices, descriptions, and included items."
    >
      {packages.length === 0 ? (
        <p className="text-sm text-gray-500 italic">No packages yet.</p>
      ) : (
        <ul className="space-y-3">
          {packages.map((p) => (
            <li
              key={p.id}
              className="rounded-xl border border-gray-100 bg-gray-50 p-3"
            >
              <div className="flex flex-col gap-2">
                <Field label="Package name">
                  <input
                    className={inputCls}
                    value={p.name}
                    onChange={(e) => update(p.id, { name: e.target.value })}
                    placeholder="e.g. Signature"
                  />
                </Field>
                <Field label="Price (TZS)">
                  <input
                    className={inputCls}
                    value={p.price}
                    onChange={(e) => update(p.id, { price: e.target.value })}
                    placeholder="4500000"
                  />
                </Field>
              </div>
              <div className="mt-2">
                <Field label="Description">
                  <textarea
                    rows={2}
                    className={inputCls}
                    value={p.description}
                    onChange={(e) =>
                      update(p.id, { description: e.target.value })
                    }
                  />
                </Field>
              </div>
              <div className="mt-2">
                <Field label="Includes (one per line)">
                  <textarea
                    rows={3}
                    className={inputCls}
                    value={p.includes}
                    onChange={(e) => update(p.id, { includes: e.target.value })}
                    placeholder="In-house catering for 200&#10;Setup + breakdown&#10;Bridal suite"
                  />
                </Field>
              </div>
              <button
                type="button"
                onClick={() => remove(p.id)}
                className="mt-2 inline-flex items-center gap-1 text-xs text-rose-700 hover:text-rose-900 font-semibold"
              >
                <Trash2 className="w-3 h-3" /> Remove package
              </button>
            </li>
          ))}
        </ul>
      )}
      <button
        type="button"
        onClick={add}
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-gray-900"
      >
        <Plus className="w-3.5 h-3.5" /> Add package
      </button>
      <SaveBar
        pending={pending}
        dirty={dirty}
        error={error}
        saved={saved}
        onSave={() =>
          save({
            packages: packages
              .filter((p) => p.name.trim() && p.price.trim())
              .map((p) => ({
                id: p.id,
                name: p.name.trim(),
                price: p.price.trim(),
                description: p.description.trim() || undefined,
                includes: p.includes
                  .split(/\r?\n/)
                  .map((s) => s.trim())
                  .filter(Boolean),
              })),
          })
        }
      />
    </Card>
  )
}
