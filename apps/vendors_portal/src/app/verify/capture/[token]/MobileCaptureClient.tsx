'use client'

import { useState, useTransition } from 'react'
import { Check, CheckCircle2, Upload } from 'lucide-react'
import CameraCapture from '@/components/CameraCapture'
import { uploadCapturedNationalId } from './actions'

type Kind = 'front' | 'back' | 'selfie'

const ORDER: Kind[] = ['front', 'back', 'selfie']

// Matches storeVerificationShot's server-side cap so the gallery-upload
// fallback rejects oversized files before encoding them into a data URL.
const MAX_UPLOAD_BYTES = 15 * 1024 * 1024

const META: Record<
  Kind,
  { label: string; hint: string; facing: 'environment' | 'user'; guide: 'card' | 'face' }
> = {
  front: {
    label: 'Front of National ID',
    hint: 'Fit the card inside the frame, then take the photo.',
    facing: 'environment',
    guide: 'card',
  },
  back: {
    label: 'Back of National ID',
    hint: 'Fit the card inside the frame, then take the photo.',
    facing: 'environment',
    guide: 'card',
  },
  selfie: {
    label: 'Selfie',
    hint: 'Center your face in the oval, look at the camera, then take the photo.',
    facing: 'user',
    guide: 'face',
  },
}

export default function MobileCaptureClient({ token }: { token: string }) {
  const [done, setDone] = useState<Record<Kind, boolean>>({
    front: false,
    back: false,
    selfie: false,
  })
  const [kind, setKind] = useState<Kind>('front')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const allDone = done.front && done.back && done.selfie

  const persistShot = (dataUrl: string) => {
    startTransition(async () => {
      const res = await uploadCapturedNationalId(token, kind, dataUrl)
      if (!res.ok) {
        setError(res.error)
        return
      }
      const next = { ...done, [kind]: true }
      setDone(next)
      const remaining = ORDER.find((k) => !next[k])
      if (remaining) setKind(remaining)
    })
  }

  const onCapture = (dataUrl: string) => {
    setError(null)
    persistShot(dataUrl)
  }

  // Fallback for vendors whose camera is blocked — denied permission, no
  // camera, or an in-app browser (WhatsApp/Instagram) that disables
  // getUserMedia. They pick a photo from their gallery instead; admin review
  // is still the backstop for every National ID. Reuses the same token-scoped
  // server action as the camera path by reading the file into a data URL.
  const handleFile = (file: File) => {
    setError(null)
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
      setError('Upload a JPG, PNG, or WEBP photo of your ID.')
      return
    }
    if (file.size === 0) {
      setError('That file is empty — pick another photo.')
      return
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setError('Photo is too large (max 15 MB). Pick a smaller one.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : ''
      if (!dataUrl) {
        setError('Could not read that photo — try another.')
        return
      }
      persistShot(dataUrl)
    }
    reader.onerror = () => setError('Could not read that photo — try another.')
    reader.readAsDataURL(file)
  }

  if (allDone) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
        <h2 className="mt-3 text-lg font-semibold text-emerald-900">
          All photos uploaded
        </h2>
        <p className="mt-1 text-sm text-emerald-800">
          You can close this page and return to your computer — your
          verification will update automatically.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="flex items-center gap-2 text-xs font-semibold">
        <KindPill label="Front" active={kind === 'front'} done={done.front} />
        <span className="h-px flex-1 bg-gray-200" />
        <KindPill label="Back" active={kind === 'back'} done={done.back} />
        <span className="h-px flex-1 bg-gray-200" />
        <KindPill label="Selfie" active={kind === 'selfie'} done={done.selfie} />
      </div>

      {error && (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700">
          {error}
        </p>
      )}

      <CameraCapture
        key={kind}
        label={META[kind].label}
        hint={META[kind].hint}
        onCapture={onCapture}
        busy={pending}
        facingMode={META[kind].facing}
        guide={META[kind].guide}
      />

      {/* Gallery-upload fallback for when the camera is unavailable (denied
          permission, no camera, or an in-app browser that blocks it). */}
      <div className="text-center">
        <label
          className={
            'inline-flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-800' +
            (pending ? ' pointer-events-none opacity-50' : '')
          }
        >
          <Upload className="h-4 w-4" />
          Camera blocked? Upload instead
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            disabled={pending}
            onChange={(e) => {
              const file = e.target.files?.[0]
              // Reset the value so picking the same file again still fires.
              e.target.value = ''
              if (file) handleFile(file)
            }}
          />
        </label>
      </div>
    </div>
  )
}

function KindPill({
  label,
  active,
  done,
}: {
  label: string
  active: boolean
  done: boolean
}) {
  return (
    <span
      className={
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 ' +
        (done
          ? 'bg-emerald-50 text-emerald-700'
          : active
            ? 'bg-[#1A1A1A] text-white'
            : 'bg-gray-100 text-gray-500')
      }
    >
      {done && <Check className="h-3 w-3" strokeWidth={3} />}
      {label}
    </span>
  )
}
