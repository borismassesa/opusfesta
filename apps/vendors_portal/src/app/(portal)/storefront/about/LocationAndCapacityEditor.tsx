'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import {
  ChevronDown,
  Crosshair,
  ExternalLink,
  Loader2,
  MapPin,
  Users,
} from 'lucide-react'
import { FieldLabel, TextInput } from '@/components/onboard/FormField'
import { saveProfileFields } from '../sections/actions'
import { ABOUT_PAGE_SAVE_EVENT } from './AboutEditor'

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
  const [locating, setLocating] = useState(false)
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const initialAsForm = {
    capacityMin: initial.capacityMin == null ? '' : String(initial.capacityMin),
    capacityMax: initial.capacityMax == null ? '' : String(initial.capacityMax),
    lat: initial.lat == null ? '' : String(initial.lat),
    lng: initial.lng == null ? '' : String(initial.lng),
  }
  const dirty = JSON.stringify(v) !== JSON.stringify(initialAsForm)

  // Parsed values used by the preview map + range hint. These mirror the
  // text inputs so a vendor sees the preview update as they type or after
  // GPS resolves.
  const parsedMin = toFiniteNumber(v.capacityMin)
  const parsedMax = toFiniteNumber(v.capacityMax)
  const parsedLat = toFiniteNumber(v.lat)
  const parsedLng = toFiniteNumber(v.lng)
  const hasPin =
    parsedLat != null &&
    parsedLng != null &&
    parsedLat >= -90 &&
    parsedLat <= 90 &&
    parsedLng >= -180 &&
    parsedLng <= 180
  const capacityRangeValid =
    parsedMin != null && parsedMax != null && parsedMax >= parsedMin

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation isn’t supported in this browser.')
      return
    }
    setError(null)
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false)
        setV((cur) => ({
          ...cur,
          lat: pos.coords.latitude.toFixed(6),
          lng: pos.coords.longitude.toFixed(6),
        }))
      },
      (err) => {
        setLocating(false)
        setError(`Couldn’t read your location: ${err.message}`)
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    )
  }

  const onSave = () => {
    setError(null)
    setSaved(false)
    startTransition(async () => {
      const res = await saveProfileFields({
        capacityMin: parsedMin,
        capacityMax: parsedMax,
        lat: parsedLat,
        lng: parsedLng,
      })
      if (!res.ok) {
        setError(res.error)
        return
      }
      setSaved(true)
    })
  }

  // The About page's single "Save changes" button is the canonical save
  // for everything on the page. AboutEditor fires ABOUT_PAGE_SAVE_EVENT
  // after its own save lands; we react by persisting capacity + map pin
  // too, but only if anything's actually changed on this card —
  // otherwise we'd overwrite a previously-set capacity with nulls.
  const onSaveRef = useRef(onSave)
  const dirtyRef = useRef(dirty)
  const canEditRef = useRef(canEdit)
  onSaveRef.current = onSave
  dirtyRef.current = dirty
  canEditRef.current = canEdit
  useEffect(() => {
    const handler = () => {
      if (!canEditRef.current || !dirtyRef.current) return
      onSaveRef.current()
    }
    window.addEventListener(ABOUT_PAGE_SAVE_EVENT, handler)
    return () => window.removeEventListener(ABOUT_PAGE_SAVE_EVENT, handler)
  }, [])

  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-6 lg:p-7 mt-6">
      <header className="mb-6 flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-[#F0DFF6] text-[#7E5896] flex items-center justify-center shrink-0">
          <Users className="w-5 h-5" strokeWidth={1.75} />
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-900 tracking-tight">
            Capacity & location
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            How many guests can you host, and where should couples find you on
            the map? Both appear on your public storefront.
          </p>
        </div>
      </header>

      {/* Capacity — single inline range so vendors see it as "from X to Y" at
          a glance rather than two unrelated fields. */}
      <div className="rounded-xl border border-gray-100 bg-gray-50/40 p-5">
        <FieldLabel>Guest capacity</FieldLabel>
        <div className="flex items-end gap-3 flex-wrap">
          <div className="w-32">
            <TextInput
              type="number"
              min={0}
              inputMode="numeric"
              value={v.capacityMin}
              onChange={(e) =>
                setV((cur) => ({ ...cur, capacityMin: e.target.value }))
              }
              placeholder="Min"
              disabled={!canEdit}
              aria-label="Minimum guests"
            />
          </div>
          <span className="text-sm text-gray-500 pb-3">to</span>
          <div className="w-32">
            <TextInput
              type="number"
              min={0}
              inputMode="numeric"
              value={v.capacityMax}
              onChange={(e) =>
                setV((cur) => ({ ...cur, capacityMax: e.target.value }))
              }
              placeholder="Max"
              disabled={!canEdit}
              aria-label="Maximum guests"
            />
          </div>
          <span className="text-sm text-gray-500 pb-3">guests</span>
        </div>
        {parsedMin != null && parsedMax != null && parsedMax < parsedMin ? (
          <p className="mt-2 text-xs text-rose-700">
            Max should be at least the minimum.
          </p>
        ) : capacityRangeValid ? (
          <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-2.5 py-1">
            {parsedMin}–{parsedMax} guests
          </p>
        ) : (
          <p className="mt-3 text-xs text-gray-500">
            Couples filter by capacity — a realistic range puts you in front of
            the right couples.
          </p>
        )}
      </div>

      {/* Map pin — GPS as the primary affordance, live OSM preview underneath
          once a pin is set, and a collapsed disclosure for vendors who'd
          rather paste coordinates by hand. */}
      <div className="mt-5 rounded-xl border border-gray-100 bg-gray-50/40 p-5">
        <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
          <div className="min-w-0">
            <FieldLabel>Map pin</FieldLabel>
            <p className="text-xs text-gray-500 -mt-1">
              Drop a pin so couples can see how close you are to their venue.
            </p>
          </div>
          <button
            type="button"
            onClick={useMyLocation}
            disabled={!canEdit || locating}
            className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full bg-[#7E5896] hover:bg-[#6B4880] text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {locating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Crosshair className="w-3.5 h-3.5" />
            )}
            {locating ? 'Locating…' : hasPin ? 'Update to my location' : 'Use my current location'}
          </button>
        </div>

        {hasPin ? (
          <>
            <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-100 aspect-[16/9] sm:aspect-[2/1]">
              <iframe
                title="Map preview"
                src={osmEmbedSrc(parsedLat!, parsedLng!)}
                loading="lazy"
                className="w-full h-full border-0"
              />
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 flex-wrap text-xs">
              <span className="inline-flex items-center gap-1.5 font-semibold text-gray-700">
                <MapPin className="w-3.5 h-3.5 text-[#7E5896]" />
                Pinned at {formatCoord(parsedLat!, 'lat')},{' '}
                {formatCoord(parsedLng!, 'lng')}
              </span>
              <a
                href={osmViewUrl(parsedLat!, parsedLng!)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[#7E5896] hover:text-[#6B4880] font-semibold"
              >
                Open in OpenStreetMap
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white px-4 py-6 text-center">
            <MapPin className="w-6 h-6 text-gray-400 mx-auto" />
            <p className="text-sm font-semibold text-gray-700 mt-2">
              No pin yet
            </p>
            <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
              The fastest way is to tap{' '}
              <span className="font-semibold text-gray-700">
                Use my current location
              </span>{' '}
              from where you're based. Your browser will ask permission first.
            </p>
          </div>
        )}

        {/* Advanced: manual coordinate entry. Hidden by default so vendors
            don't have to look at decimal degrees unless they want to. */}
        <details
          open={advancedOpen}
          onToggle={(e) => setAdvancedOpen((e.target as HTMLDetailsElement).open)}
          className="mt-4 group"
        >
          <summary className="list-none cursor-pointer inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900">
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform ${advancedOpen ? 'rotate-180' : ''}`}
            />
            Enter coordinates manually
          </summary>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
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
            Decimal degrees. Right-click any spot on{' '}
            <a
              href="https://www.openstreetmap.org"
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-gray-700"
            >
              openstreetmap.org
            </a>{' '}
            to copy coordinates from a specific place.
          </p>
        </details>
      </div>

      <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between gap-3 flex-wrap text-xs">
        <span className="text-gray-500">
          Saves with the rest of your profile when you click{' '}
          <span className="font-semibold text-gray-700">Save changes</span> at
          the bottom of the page.
        </span>
        <div>
          {error && <span className="text-rose-700">{error}</span>}
          {pending && (
            <span className="inline-flex items-center gap-1 text-amber-700">
              <Loader2 className="w-3 h-3 animate-spin" /> Saving…
            </span>
          )}
          {saved && !error && !pending && (
            <span className="text-emerald-700">Capacity & map saved.</span>
          )}
        </div>
      </div>
    </section>
  )
}

function toFiniteNumber(raw: string): number | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  const n = Number(trimmed)
  return Number.isFinite(n) ? n : null
}

// Friendly coordinate display — "6.79° S" reads more like a map label than
// "-6.792354", but we keep the precision available in the underlying value.
function formatCoord(value: number, axis: 'lat' | 'lng'): string {
  const positive = Math.abs(value).toFixed(4)
  if (axis === 'lat') return `${positive}° ${value >= 0 ? 'N' : 'S'}`
  return `${positive}° ${value >= 0 ? 'E' : 'W'}`
}

// OpenStreetMap embed iframe — no API key, no analytics, decent base tiles.
// Bounding box is a small window around the pin (~1km depending on
// latitude). The `marker` param draws the red pin at the exact spot.
function osmEmbedSrc(lat: number, lng: number): string {
  const delta = 0.008 // ≈ ±900m at the equator
  const bbox = [lng - delta, lat - delta, lng + delta, lat + delta].join(',')
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`
}

function osmViewUrl(lat: number, lng: number): string {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`
}
