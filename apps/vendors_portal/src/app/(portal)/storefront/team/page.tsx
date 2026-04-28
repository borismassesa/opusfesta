'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Camera, Plus, Trash2, User, X } from 'lucide-react'
import { FieldLabel, TextArea, TextInput } from '@/components/onboard/FormField'
import { useOnboardingDraft, type TeamMember } from '@/lib/onboarding/draft'
import { getStorefrontSections } from '@/lib/storefront/completion'
import { cn } from '@/lib/utils'

const newMember = (seed?: Partial<TeamMember>): TeamMember => ({
  id:
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `tm-${Math.random().toString(36).slice(2, 10)}`,
  name: '',
  role: '',
  bio: '',
  ...seed,
})

const initialsFor = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export default function TeamPage() {
  const router = useRouter()
  const { draft, update, hydrated } = useOnboardingDraft()

  // Track every blob URL we mint so we can revoke them on unmount and prevent
  // memory leaks. Persisted draft state never holds blob URLs.
  const objectUrlsRef = useRef<string[]>([])
  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((u) => URL.revokeObjectURL(u))
    }
  }, [])

  const nextHref = useMemo(() => {
    const sections = getStorefrontSections(draft)
    const idx = sections.findIndex((s) => s.id === 'team')
    return idx >= 0 && idx < sections.length - 1 ? sections[idx + 1].href : null
  }, [draft])

  if (!hydrated) return <div className="p-8" aria-hidden />

  const team = draft.team

  const updateMember = (id: string, patch: Partial<TeamMember>) => {
    update({ team: team.map((m) => (m.id === id ? { ...m, ...patch } : m)) })
  }

  const addMember = () => {
    update({ team: [...team, newMember()] })
  }

  const removeMember = (id: string) => {
    const removed = team.find((m) => m.id === id)
    if (removed?.avatarUrl) URL.revokeObjectURL(removed.avatarUrl)
    update({ team: team.filter((m) => m.id !== id) })
  }

  const setAvatar = (id: string, file: File | null) => {
    const member = team.find((m) => m.id === id)
    // Revoke the previous blob if there was one — new file or clearing both
    // need cleanup.
    if (member?.avatarUrl) URL.revokeObjectURL(member.avatarUrl)
    if (!file) {
      updateMember(id, { avatarUrl: undefined })
      return
    }
    const url = URL.createObjectURL(file)
    objectUrlsRef.current.push(url)
    updateMember(id, { avatarUrl: url })
  }

  const onNext = () => {
    if (nextHref) router.push(nextHref)
  }

  const completeMembers = team.filter((m) => m.name.trim() && m.role.trim()).length

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex-1 px-6 lg:px-10 pt-4 lg:pt-5 pb-6">
        <div className="max-w-4xl">
          {team.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-[#F0DFF6] text-[#7E5896] flex items-center justify-center">
                <User className="w-6 h-6" />
              </div>
              <p className="text-sm text-gray-700 mt-5 max-w-md mx-auto leading-relaxed">
                No team members yet. Add at least the lead person couples will be working with —
                even solo vendors benefit from a personal “About me”.
              </p>
              <button
                type="button"
                onClick={addMember}
                className="inline-flex items-center gap-2 mt-5 bg-gray-900 text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-gray-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add a team member
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {team.map((member) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  onChange={(patch) => updateMember(member.id, patch)}
                  onSetAvatar={(file) => setAvatar(member.id, file)}
                  onRemove={() => removeMember(member.id)}
                />
              ))}

              <button
                type="button"
                onClick={addMember}
                className="w-full bg-white rounded-2xl border border-dashed border-gray-300 hover:border-gray-500 hover:bg-gray-50 transition-colors py-5 inline-flex items-center justify-center gap-2 text-sm font-semibold text-gray-900"
              >
                <Plus className="w-4 h-4" />
                Add another member
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 border-t border-gray-100 bg-white/95 backdrop-blur z-30">
        <div className="px-6 lg:px-10 py-3 flex items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            <span className="font-semibold text-gray-900 tabular-nums">{completeMembers}</span>{' '}
            complete · {team.length} total
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

function MemberCard({
  member,
  onChange,
  onSetAvatar,
  onRemove,
}: {
  member: TeamMember
  onChange: (patch: Partial<TeamMember>) => void
  onSetAvatar: (file: File | null) => void
  onRemove: () => void
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-6 lg:p-7">
      <div className="flex items-start gap-5">
        <Avatar member={member} onSetFile={onSetAvatar} />

        <div className="flex-1 min-w-0 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <FieldLabel required>Full name</FieldLabel>
              <TextInput
                placeholder="e.g. Mussa Ngalawa"
                value={member.name}
                onChange={(e) => onChange({ name: e.target.value })}
              />
            </div>
            <div>
              <FieldLabel required>Role</FieldLabel>
              <TextInput
                placeholder="e.g. Lead Photographer, Owner, Coordinator"
                value={member.role}
                onChange={(e) => onChange({ role: e.target.value })}
              />
            </div>
          </div>
          <div>
            <FieldLabel>Short bio</FieldLabel>
            <TextArea
              placeholder="Two or three sentences. What they bring, what they’re known for."
              value={member.bio}
              onChange={(e) => onChange({ bio: e.target.value })}
              rows={3}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove member"
          className="-mr-2 -mt-2 p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-100 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

function Avatar({
  member,
  onSetFile,
}: {
  member: TeamMember
  onSetFile: (file: File | null) => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const initials = initialsFor(member.name)
  const hasAvatar = Boolean(member.avatarUrl)
  const hasName = member.name.trim().length > 0

  return (
    <button
      type="button"
      onClick={() => fileInputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragOver(false)
        const file = e.dataTransfer.files?.[0]
        if (file && file.type.startsWith('image/')) onSetFile(file)
      }}
      aria-label={hasAvatar ? 'Replace photo' : 'Upload photo'}
      className={cn(
        'shrink-0 relative w-20 h-20 rounded-2xl overflow-hidden group transition-all',
        // The empty state uses a dashed border so the dropzone affordance is
        // obvious without the floating pip cluttering the corner.
        !hasAvatar && 'border-2 border-dashed border-[#D4B6E0] hover:border-[#7E5896]',
        dragOver && 'border-solid border-gray-900 ring-2 ring-gray-900 ring-offset-2',
      )}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onSetFile(file)
          e.target.value = ''
        }}
      />

      {hasAvatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={member.avatarUrl}
          alt={member.name || 'Team member'}
          className="w-full h-full object-cover"
        />
      ) : hasName ? (
        <div className="w-full h-full bg-[#F0DFF6] text-[#7E5896] flex items-center justify-center font-bold text-xl">
          {initials}
        </div>
      ) : (
        // Truly empty: a centered Camera icon reads as "drop a photo here"
        // far better than a placeholder "?" character.
        <div className="w-full h-full bg-[#FAF1FD] text-[#7E5896] flex flex-col items-center justify-center gap-0.5">
          <Camera className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-wider">Photo</span>
        </div>
      )}

      {/* Hover overlay — only shown when an avatar or initials exist; the
          empty state already telegraphs uploadability via the dashed border. */}
      {(hasAvatar || hasName) && (
        <span
          className={cn(
            'absolute inset-0 flex flex-col items-center justify-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity',
            hasAvatar ? 'bg-black/55 text-white' : 'bg-black/15 text-[#7E5896]',
          )}
          aria-hidden
        >
          <Camera className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-wider">
            {hasAvatar ? 'Replace' : 'Upload'}
          </span>
        </span>
      )}

      {/* Remove pip (only when populated) — moved inside the avatar so it
          doesn't overhang the corner. */}
      {hasAvatar ? (
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation()
            onSetFile(null)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              e.stopPropagation()
              onSetFile(null)
            }
          }}
          className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-white/95 text-gray-700 hover:text-rose-600 flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          aria-label="Remove photo"
          title="Remove photo"
        >
          <X className="w-3 h-3" />
        </span>
      ) : null}
    </button>
  )
}
