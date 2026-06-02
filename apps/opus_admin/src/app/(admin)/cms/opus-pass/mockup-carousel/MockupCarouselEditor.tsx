'use client'

import { useState, useTransition } from 'react'
import { ChevronDown, ChevronUp, Loader2, Plus, Save, Trash2 } from 'lucide-react'
import { ImageUploadField } from '@/components/cms/ImageUploadField'
import { resolveOpusPassAssetUrl } from '@/lib/cms/opus-pass-asset-url'
import { upsertMockupCarouselScenes, deleteMockupCarouselScene, type MockupScene } from './actions'

const IMAGE_PREFIX = 'opus-pass/mockup-carousel'

// Default CSS background colours for the five canonical scenes.
const SCENE_BG: Record<string, string> = {
  'flat-lay':    '#EDE9E1',
  'dark-studio': '#111111',
  'paper-stack': '#F0EBE3',
  'envelope':    '#F8F5F0',
  'phone':       '#F2F2F2',
}
const FALLBACK_BG = '#F0EDE8'

// Default human labels for the five canonical scenes (shown when label is null/empty).
const SCENE_DEFAULT_LABEL: Record<string, string> = {
  'flat-lay':    'Flat lay',
  'dark-studio': 'Dark studio',
  'paper-stack': 'Paper stack',
  'envelope':    'Envelope',
  'phone':       'Phone',
}

type SceneItem = {
  id: string
  label: string  // what the designer typed; empty string = use default
  url: string
  sortOrder: number
  isNew: boolean
}

function sceneLabel(item: SceneItem): string {
  return item.label.trim() || SCENE_DEFAULT_LABEL[item.id] || item.id
}

// ─── Preview panel ────────────────────────────────────────────────────────────

function MockupCarouselPreview({ scenes }: { scenes: SceneItem[] }) {
  const [activeId, setActiveId] = useState<string>(() => scenes[0]?.id ?? '')
  const active = scenes.find((s) => s.id === activeId) ?? scenes[0]
  if (!active) return null

  const url = active.url ? resolveOpusPassAssetUrl(active.url) : null
  const bg = SCENE_BG[active.id] ?? FALLBACK_BG

  return (
    <div className="space-y-2">
      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Preview</p>
      <div className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-md" style={{ background: bg }}>
        {url ? (
          <img src={url} alt={sceneLabel(active)} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[11px] text-gray-400">No photo</span>
          </div>
        )}
        <div className="absolute left-3 bottom-3 bg-white/80 backdrop-blur-sm rounded px-2 py-0.5">
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-700">
            {sceneLabel(active)}
          </span>
        </div>
      </div>
      <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${scenes.length}, minmax(0, 1fr))` }}>
        {scenes.map((s) => {
          const thumb = s.url ? resolveOpusPassAssetUrl(s.url) : null
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveId(s.id)}
              title={sceneLabel(s)}
              className={`relative aspect-[3/4] rounded overflow-hidden transition ${
                s.id === activeId
                  ? 'ring-2 ring-[#1A1A1A]'
                  : 'ring-1 ring-gray-200 hover:ring-gray-400'
              }`}
              style={{ background: SCENE_BG[s.id] ?? FALLBACK_BG }}
            >
              {thumb && <img src={thumb} alt={sceneLabel(s)} className="absolute inset-0 w-full h-full object-cover" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Editor ───────────────────────────────────────────────────────────────────

export default function MockupCarouselEditor({ initial }: { initial: MockupScene[] }) {
  const [scenes, setScenes] = useState<SceneItem[]>(() =>
    initial.map((s, i) => ({
      id: s.scene,
      label: s.label ?? '',
      url: s.url,
      sortOrder: s.sort_order ?? i,
      isNew: false,
    }))
  )

  const [pending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  function updateScene(id: string, patch: Partial<SceneItem>) {
    setScenes((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)))
    setSaved(false)
  }

  function moveScene(id: string, dir: -1 | 1) {
    setScenes((prev) => {
      const idx = prev.findIndex((s) => s.id === id)
      const target = idx + dir
      if (target < 0 || target >= prev.length) return prev
      const next = [...prev]
      ;[next[idx], next[target]] = [next[target], next[idx]]
      return next.map((s, i) => ({ ...s, sortOrder: i }))
    })
    setSaved(false)
  }

  function addScene() {
    const newId = `scene_${Date.now()}`
    setScenes((prev) => [
      ...prev,
      { id: newId, label: '', url: '', sortOrder: prev.length, isNew: true },
    ])
    setSaved(false)
  }

  function removeScene(id: string, isNew: boolean) {
    if (isNew) {
      setScenes((prev) => prev.filter((s) => s.id !== id).map((s, i) => ({ ...s, sortOrder: i })))
      return
    }
    setDeletingId(id)
    startTransition(async () => {
      try {
        await deleteMockupCarouselScene(id)
        setScenes((prev) => prev.filter((s) => s.id !== id).map((s, i) => ({ ...s, sortOrder: i })))
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err))
      } finally {
        setDeletingId(null)
      }
    })
  }

  function save() {
    setError(null)
    setSaved(false)
    const payload: MockupScene[] = scenes.map((s) => ({
      scene: s.id,
      url: s.url,
      label: s.label.trim() || null,
      sort_order: s.sortOrder,
    }))
    startTransition(async () => {
      try {
        await upsertMockupCarouselScenes(payload)
        setScenes((prev) => prev.map((s) => ({ ...s, isNew: false })))
        setSaved(true)
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err))
      }
    })
  }

  return (
    <div className="py-2 space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-gray-500">
          Upload one photo per scene. Edit names, reorder, add or remove scenes — changes apply to every product page.
        </p>
        <div className="flex items-center gap-2 shrink-0">
          {error && (
            <span className="text-xs text-red-600 font-medium max-w-[280px] truncate" title={error}>{error}</span>
          )}
          {saved && !error && (
            <span className="text-xs text-emerald-600 font-medium">Saved</span>
          )}
          <button
            type="button"
            onClick={save}
            disabled={pending}
            className="flex items-center gap-1.5 text-sm font-semibold text-white bg-[#C9A0DC] hover:bg-[#b97fd0] px-4 py-1.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save all
          </button>
        </div>
      </div>

      {/* Two-column layout: scenes grid + sticky preview */}
      <div className="flex gap-8 items-start">
        <div className="flex-1 min-w-0 space-y-4">
          {scenes.map((scene, idx) => (
            <div
              key={scene.id}
              className="bg-white border border-gray-100 rounded-2xl p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]"
            >
              {/* Scene header: label input + reorder + delete */}
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="text"
                  value={scene.label}
                  onChange={(e) => updateScene(scene.id, { label: e.target.value })}
                  placeholder={SCENE_DEFAULT_LABEL[scene.id] ?? 'Scene name'}
                  className="flex-1 text-sm font-bold text-gray-900 bg-transparent border-b border-transparent hover:border-gray-200 focus:border-[#C9A0DC] focus:outline-none py-0.5 transition-colors placeholder:text-gray-300 placeholder:font-normal"
                />
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => moveScene(scene.id, -1)}
                    disabled={idx === 0 || pending}
                    title="Move up"
                    className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 transition"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveScene(scene.id, 1)}
                    disabled={idx === scenes.length - 1 || pending}
                    title="Move down"
                    className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 transition"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeScene(scene.id, scene.isNew)}
                    disabled={pending}
                    title="Delete scene"
                    className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-30 transition"
                  >
                    {deletingId === scene.id
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <ImageUploadField
                label="Scene photo"
                value={scene.url}
                onChange={(v) => updateScene(scene.id, { url: v })}
                pathPrefix={IMAGE_PREFIX}
                previewAspect="aspect-[3/4]"
                previewWidth="max-w-[160px]"
                accept="image"
              />
            </div>
          ))}

          {/* Add scene */}
          <button
            type="button"
            onClick={addScene}
            disabled={pending}
            className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-[#C9A0DC] border-2 border-dashed border-[#C9A0DC]/40 hover:border-[#C9A0DC] hover:bg-[#C9A0DC]/5 rounded-2xl py-4 transition disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Add scene
          </button>
        </div>

        {/* Sticky preview */}
        <div className="w-[200px] shrink-0 sticky top-6">
          <MockupCarouselPreview scenes={scenes} />
        </div>
      </div>
    </div>
  )
}
