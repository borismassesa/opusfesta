'use client'

import { useState, useTransition } from 'react'
import { Crosshair, MapPin, Save, Users } from 'lucide-react'
import { FieldLabel, TextInput } from '@/components/onboard/FormField'
import { saveProfileFields } from '../sections/actions'

// Capacity + map coordinates were previously admin-only fields (filled in by
// the OpusFesta team via the operations review page). Vendors can now set
// them directly. Both go straight to structured columns on `vendors`:
//   capacity → vendors.capacity (jsonb { min, max })
//   lat / lng → vendors.lat / vendors.lng (numeric)

export type LocationAndCapacityInitial = {
  capacityMin: number | null
  capacityMax: number | null
  lat: number | null
  lng: number | null
}

export default function LocationAndCapacityEditor({
  initial,
  canEdit,
}: {
  initial: LocationAndCapacityInitial
  canEdit: boolean
}) {
  const [v, setV] = useState({
    capacityMin: initial.capacityMin == null ? '' : String(initial.capacityMin),
    capacityMax: initial.capacityMax == null ? '' : String(initial.capacityMax),
    lat: initial.lat == null ? '' : String(initial.lat),
    lng: initial.lng == null ? '' : String(initial.lng),
  })

  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const initialAsForm = {
    capacityMin: initial.capacityMin == null ? '' : String(initial.capacityMin),
    capacityMax: initial.capacityMax == null ? '' : String(initial.capacityMax),
    lat: initial.lat == null ? '' : String(initial.lat),
    lng: initial.lng == null ? '' : String(initial.lng),
  }
  const dirty = JSON.stringify(v) !== JSON.stringify(initialAsForm)

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation isn’t supported in this browser.')
      return
    }
    setError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setV((cur) => ({
          ...cur,
          lat: pos.coords.latitude.toFixed(6),
          lng: pos.coords.longitude.toFixed(6),
        }))
      },
      (err) => {
        setError(`Couldn’t read your location: ${err.message}`)
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    )
  }

  const onSave = () => {
    setError(null)
    setSaved(false)
    const parseNum = (raw: string) => {
      const trimmed = raw.trim()
      if (!trimmed) return null
      const n = Number(trimmed)
      return Number.isFinite(n) ? n : null
    }
    startTransition(async () => {
      const res = await saveProfileFields({
        capacityMin: parseNum(v.capacityMin),
        capacityMax: parseNum(v.capacityMax),
        lat: parseNum(v.lat),
        lng: parseNum(v.lng),
      })
      if (!res.ok) {
        setError(res.error)
        return
      }
      setSaved(true)
    })
  }

  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-6 lg:p-7 mt-6">
      <header className="mb-5 flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-[#F0DFF6] text-[#7E5896] flex items-center justify-center shrink-0">
          <Users className="w-5 h-5" strokeWidth={1.75} />
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-900 tracking-tight">
            Capacity & map pin
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Tell couples how many guests you can host and pin yourself on the
            map. Both appear on your public storefront when set.
          </p>
        </div>
      </header>

      <div className="flex flex-col gap-4">
        <div>
          <FieldLabel>Capacity min (guests)</FieldLabel>
          <TextInput
            type="number"
            min={0}
            value={v.capacityMin}
            onChange={(e) =>
              setV((cur) => ({ ...cur, capacityMin: e.target.value }))
            }
            placeholder="e.g. 60"
            disabled={!canEdit}
          />
        </div>
        <div>
          <FieldLabel>Capacity max (guests)</FieldLabel>
          <TextInput
            type="number"
            min={0}
            value={v.capacityMax}
            onChange={(e) =>
              setV((cur) => ({ ...cur, capacityMax: e.target.value }))
            }
            placeholder="e.g. 200"
            disabled={!canEdit}
          />
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 inline-flex items-center gap-1.5">
            <MapPin className="w-3 h-3" /> Map pin
          </p>
          <button
            type="button"
            onClick={useMyLocation}
            disabled={!canEdit}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <Crosshair className="w-3 h-3" />
            Use my current location
          </button>
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <FieldLabel>Latitude</FieldLabel>
            <TextInput
              type="text"
              inputMode="decimal"
              value={v.lat}
              onChange={(e) =>
                setV((cur) => ({ ...cur, lat: e.target.value }))
              }
              placeholder="-6.792354"
              disabled={!canEdit}
            />
          </div>
          <div>
            <FieldLabel>Longitude</FieldLabel>
            <TextInput
              type="text"
              inputMode="decimal"
              value={v.lng}
              onChange={(e) =>
                setV((cur) => ({ ...cur, lng: e.target.value }))
              }
              placeholder="39.208328"
              disabled={!canEdit}
            />
          </div>
        </div>
        <p className="mt-2 text-[11px] text-gray-500">
          Both required for the map embed to show on your storefront. Decimal
          degrees, e.g. <span className="font-mono">-6.792354, 39.208328</span>.
        </p>
      </div>

      <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between gap-3 flex-wrap">
        <div className="text-xs">
          {error && <span className="text-rose-700">{error}</span>}
          {saved && !error && <span className="text-emerald-700">Saved.</span>}
        </div>
        <button
          type="button"
          onClick={onSave}
          disabled={!canEdit || pending || !dirty}
          className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full bg-gray-900 hover:bg-black text-white disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          <Save className="w-3.5 h-3.5" />
          {pending ? 'Saving…' : 'Save capacity & map'}
        </button>
      </div>
    </section>
  )
}
