'use client'

import { useMemo, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Plus, Sparkles, X } from 'lucide-react'
import { OptionCard } from '@/components/onboard/OptionCard'
import { FieldLabel, TextInput } from '@/components/onboard/FormField'
import { useOnboardingDraft } from '@/lib/onboarding/draft'
import { getServicesForCategory } from '@/lib/onboarding/services'
import { findCategory } from '@/lib/onboarding/categories'
import { getStorefrontSections } from '@/lib/storefront/completion'

const MAX_CUSTOM_LABEL = 60

export default function StorefrontServicesPage() {
  const router = useRouter()
  const { draft, update, hydrated } = useOnboardingDraft()
  const [customDraft, setCustomDraft] = useState('')

  const nextHref = useMemo(() => {
    const sections = getStorefrontSections(draft)
    const idx = sections.findIndex((s) => s.id === 'services')
    return idx >= 0 && idx < sections.length - 1 ? sections[idx + 1].href : null
  }, [draft])

  if (!hydrated) return <div className="p-8" aria-hidden />

  const services = getServicesForCategory(draft.categoryId)
  const category = findCategory(draft.categoryId)
  const presetSelected = draft.specialServices.length
  const customSelected = draft.customServices.length
  const total = presetSelected + customSelected

  const toggleService = (id: string) => {
    const set = new Set(draft.specialServices)
    if (set.has(id)) set.delete(id)
    else set.add(id)
    update({ specialServices: Array.from(set) })
  }

  const addCustom = (e: FormEvent) => {
    e.preventDefault()
    const label = customDraft.trim().slice(0, MAX_CUSTOM_LABEL)
    if (!label) return

    // De-dupe (case-insensitive) against both lists so vendors can't accidentally
    // duplicate a preset they already toggled.
    const lower = label.toLowerCase()
    const inPresets = services.some(
      (s) => draft.specialServices.includes(s.id) && s.label.toLowerCase() === lower,
    )
    const inCustom = draft.customServices.some((c) => c.toLowerCase() === lower)
    if (inPresets || inCustom) {
      setCustomDraft('')
      return
    }

    update({ customServices: [...draft.customServices, label] })
    setCustomDraft('')
  }

  const removeCustom = (label: string) => {
    update({ customServices: draft.customServices.filter((c) => c !== label) })
  }

  const onNext = () => {
    if (nextHref) router.push(nextHref)
  }

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex-1 px-6 lg:px-10 pt-4 lg:pt-5 pb-6">
        <div className="max-w-4xl space-y-6">
          {/* 1. Preset services for the vendor's category */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-6 lg:p-7">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-gray-900 tracking-tight">
                  {category?.profileLabel ?? 'Vendor'} services
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Pick what couples can book you for. These power search filters too.
                </p>
              </div>
              <span className="shrink-0 text-xs font-semibold text-gray-700 tabular-nums">
                {presetSelected} / {services.length}
              </span>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {services.map((s) => (
                <OptionCard
                  key={s.id}
                  variant="checkbox"
                  label={s.label}
                  selected={draft.specialServices.includes(s.id)}
                  onToggle={() => toggleService(s.id)}
                />
              ))}
            </div>
          </section>

          {/* 2. Custom services — vendor's own */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-6 lg:p-7">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-gray-900 tracking-tight">
                  Your own services
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Add anything specific to your business that isn’t in the list above.
                </p>
              </div>
              <span className="shrink-0 text-xs font-semibold text-gray-700 tabular-nums">
                {customSelected} added
              </span>
            </div>

            {/* Pills for current custom services */}
            {draft.customServices.length > 0 ? (
              <ul className="flex flex-wrap gap-2 mb-5">
                {draft.customServices.map((label) => (
                  <li
                    key={label}
                    className="group inline-flex items-center gap-2 bg-[#F0DFF6] text-[#7E5896] text-sm font-semibold pl-3 pr-1.5 py-1.5 rounded-full"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[220px]">{label}</span>
                    <button
                      type="button"
                      onClick={() => removeCustom(label)}
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[#7E5896] hover:bg-white/70 transition-colors"
                      aria-label={`Remove ${label}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/60 px-4 py-5 text-center mb-5">
                <p className="text-sm text-gray-500">
                  No custom services yet. Add one below — e.g.{' '}
                  <span className="font-medium text-gray-700">“Polaroid guest book”</span> or{' '}
                  <span className="font-medium text-gray-700">“Drone aerial portraits”</span>.
                </p>
              </div>
            )}

            <form onSubmit={addCustom} className="grid sm:grid-cols-[1fr_auto] gap-3 items-end">
              <div>
                <FieldLabel>Add a custom service</FieldLabel>
                <TextInput
                  value={customDraft}
                  onChange={(e) => setCustomDraft(e.target.value.slice(0, MAX_CUSTOM_LABEL))}
                  placeholder="e.g. Bridal henna sessions"
                  maxLength={MAX_CUSTOM_LABEL}
                />
              </div>
              <button
                type="submit"
                disabled={!customDraft.trim()}
                className="inline-flex items-center justify-center gap-1.5 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add service
              </button>
            </form>
          </section>
        </div>
      </div>

      {/* Sticky bottom bar — Next button */}
      <div className="sticky bottom-0 border-t border-gray-100 bg-white/95 backdrop-blur z-30">
        <div className="px-6 lg:px-10 py-3 flex items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            <span className="font-semibold text-gray-900 tabular-nums">{total}</span> service
            {total === 1 ? '' : 's'} selected
            {total < 3 ? (
              <span className="text-amber-700 ml-1.5">
                — pick at least 3 so couples can find you in filters
              </span>
            ) : null}
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
