// Drag-to-reorder editor for the public /advice-and-ideas Editor Picks
// row. Three sections:
//
//  1. Slots         — the up-to-5 pinned articles. Drag rows to reorder.
//                     Click the X to send a row back to "the pool" (still
//                     featured, just unpinned).
//  2. Featured pool — articles with featured=true but no rank. They fill
//                     any empty slots on the public site in published_at
//                     order. Click "Pin" to lock one to a specific slot.
//  3. Add article   — searchable list of every other published article.
//                     Click to add as the next pinned slot.
//
// Reorder/pin/unpin all funnel through the same `reorderFrontPage` server
// action, which is bulk — it rewrites the whole rank sequence in one call.
// Keeps the data model simple: there's no partial-update path to get out
// of sync with.
//
// Server actions still live with the article CRUD module in
// /operations/articles/actions.ts because they mutate advice_ideas_posts
// rows. This page is purely a "how does the public front compose itself"
// view, which is why it lives under CMS instead.

'use client'

import { useMemo, useRef, useState, useTransition } from 'react'
import Link from 'next/link'
import {
  GripVertical,
  Plus,
  Search,
  Star,
  TrendingUp,
  X,
} from 'lucide-react'
import {
  reorderFrontPage,
  togglePostFeatured,
} from '@/app/(admin)/operations/articles/actions'
import ArticleThumbnail from '@/app/(admin)/operations/articles/_articles/ArticleThumbnail'

export type FrontPageArticle = {
  id: string
  slug: string
  title: string
  category: string
  authorName: string | null
  publishedAt: string
  featured: boolean
  featuredRank: number | null
  heroSrc: string | null
  heroAlt: string | null
  heroType: 'image' | 'video'
}

type Props = {
  articles: FrontPageArticle[]
  maxSlots: number
}

export default function FrontPageEditor({ articles, maxSlots }: Props) {
  // Local copy keeps the UI responsive while a server action is in
  // flight. We reconcile against the server result after each save.
  const [pinned, setPinned] = useState<FrontPageArticle[]>(() =>
    articles
      .filter((a) => a.featured && a.featuredRank != null)
      .sort((a, b) => (a.featuredRank ?? 0) - (b.featuredRank ?? 0))
  )
  const [pool, setPool] = useState<FrontPageArticle[]>(() =>
    articles.filter((a) => a.featured && a.featuredRank == null)
  )
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickerQuery, setPickerQuery] = useState('')
  const [pending, startTransition] = useTransition()
  const [saveError, setSaveError] = useState<string | null>(null)
  const dragIndexRef = useRef<number | null>(null)

  const unfeatured = useMemo(
    () => articles.filter((a) => !a.featured),
    [articles]
  )
  const filteredUnfeatured = useMemo(() => {
    const q = pickerQuery.trim().toLowerCase()
    if (!q) return unfeatured
    return unfeatured.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.slug.toLowerCase().includes(q) ||
        (a.authorName?.toLowerCase().includes(q) ?? false) ||
        a.category.toLowerCase().includes(q)
    )
  }, [unfeatured, pickerQuery])

  // Persist the current pinned order. Bulk replace — the action
  // clears any orphan ranks for us so the data model stays clean.
  function persist(nextPinned: FrontPageArticle[]) {
    setSaveError(null)
    const ids = nextPinned.map((a) => a.id)
    startTransition(async () => {
      try {
        await reorderFrontPage(ids)
      } catch (err) {
        setSaveError(
          err instanceof Error
            ? err.message
            : 'Could not save the new order. Try again.'
        )
      }
    })
  }

  function move(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex || toIndex < 0 || toIndex >= pinned.length) return
    const next = [...pinned]
    const [item] = next.splice(fromIndex, 1)
    next.splice(toIndex, 0, item)
    setPinned(next)
    persist(next)
  }

  function unpin(id: string) {
    const article = pinned.find((a) => a.id === id)
    if (!article) return
    const nextPinned = pinned.filter((a) => a.id !== id)
    setPinned(nextPinned)
    setPool([{ ...article, featuredRank: null }, ...pool])
    persist(nextPinned)
  }

  function pinFromPool(id: string) {
    if (pinned.length >= maxSlots) return
    const article = pool.find((a) => a.id === id)
    if (!article) return
    const nextPinned = [...pinned, { ...article, featuredRank: pinned.length + 1 }]
    setPinned(nextPinned)
    setPool(pool.filter((a) => a.id !== id))
    persist(nextPinned)
  }

  function addFromPicker(article: FrontPageArticle) {
    if (pinned.length >= maxSlots) return
    setSaveError(null)
    setPickerQuery('')
    setPickerOpen(false)
    // Two writes: flip `featured` on first, then the bulk reorder.
    // togglePostFeatured already revalidates and we follow with the
    // rank update so the pinned set settles in one batch.
    startTransition(async () => {
      try {
        await togglePostFeatured(article.id, true)
        const nextPinned = [
          ...pinned,
          { ...article, featured: true, featuredRank: pinned.length + 1 },
        ]
        setPinned(nextPinned)
        await reorderFrontPage(nextPinned.map((a) => a.id))
      } catch (err) {
        setSaveError(
          err instanceof Error
            ? err.message
            : 'Could not add the article. Try again.'
        )
      }
    })
  }

  function removeFromFeatured(id: string) {
    // From the pool — unfeatures the article entirely.
    setSaveError(null)
    setPool(pool.filter((a) => a.id !== id))
    startTransition(async () => {
      try {
        await togglePostFeatured(id, false)
      } catch (err) {
        setSaveError(
          err instanceof Error
            ? err.message
            : 'Could not remove the article. Try again.'
        )
      }
    })
  }

  // Native HTML5 drag handlers — small list (5 items max) so we don't
  // need react-dnd or framer for this.
  function onDragStart(index: number) {
    dragIndexRef.current = index
  }
  function onDragOver(e: React.DragEvent) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }
  function onDrop(targetIndex: number) {
    const source = dragIndexRef.current
    dragIndexRef.current = null
    if (source == null) return
    move(source, targetIndex)
  }

  return (
    <div className="space-y-6">
      {saveError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {saveError}
        </div>
      )}

      {/* ── PINNED SLOTS ────────────────────────────────────────────── */}
      <section className="rounded-2xl border border-gray-100 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
        <header className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              Pinned slots
            </h2>
            <p className="mt-0.5 text-xs text-gray-500">
              {pinned.length} of {maxSlots} slots filled · slot 1 is the
              Trending hero · drag to reorder
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPickerOpen((v) => !v)}
            disabled={pinned.length >= maxSlots || pending}
            className="flex items-center gap-1.5 rounded-lg bg-[#C9A0DC] px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#b97fd0] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Add article
          </button>
        </header>

        {pinned.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <Star className="mx-auto h-8 w-8 text-gray-300" />
            <p className="mt-3 text-sm font-medium text-gray-700">
              No pinned slots yet
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Click <span className="font-semibold">Add article</span> to put
              something on the front, or pin from the featured pool below.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {pinned.map((article, idx) => (
              <li
                key={article.id}
                draggable={!pending}
                onDragStart={() => onDragStart(idx)}
                onDragOver={onDragOver}
                onDrop={() => onDrop(idx)}
                className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-gray-50/60"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">
                  {idx + 1}
                </span>
                {idx === 0 && (
                  <span
                    title="Hero spot in the Trending section on /advice-and-ideas"
                    className="inline-flex shrink-0 items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-700 ring-1 ring-purple-200"
                  >
                    <TrendingUp className="h-3 w-3" />
                    Hero
                  </span>
                )}
                <GripVertical className="h-4 w-4 shrink-0 text-gray-300" />
                <ArticleThumbnail
                  category={article.category}
                  heroSrc={article.heroSrc}
                  heroAlt={article.heroAlt}
                  heroType={article.heroType}
                />
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/operations/articles/${article.id}`}
                    className="block truncate text-sm font-semibold text-gray-900 hover:text-[#7E5896]"
                  >
                    {article.title || 'Untitled'}
                  </Link>
                  <p className="mt-0.5 truncate text-xs text-gray-500">
                    {article.category}
                    {article.authorName ? ` · by ${article.authorName}` : ''}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {idx > 0 && (
                    <button
                      type="button"
                      onClick={() => move(idx, idx - 1)}
                      disabled={pending}
                      title="Move up"
                      className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:opacity-40"
                    >
                      ↑
                    </button>
                  )}
                  {idx < pinned.length - 1 && (
                    <button
                      type="button"
                      onClick={() => move(idx, idx + 1)}
                      disabled={pending}
                      title="Move down"
                      className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:opacity-40"
                    >
                      ↓
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => unpin(article.id)}
                    disabled={pending}
                    title="Unpin (keeps it in the featured pool)"
                    className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-amber-50 hover:text-amber-700 disabled:opacity-40"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── ADD-ARTICLE PICKER (when open) ──────────────────────────── */}
      {pickerOpen && (
        <section className="rounded-2xl border border-gray-200 bg-white shadow-[0_4px_20px_-8px_rgba(0,0,0,0.1)]">
          <header className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h3 className="text-sm font-semibold text-gray-900">
              Pick an article to add to the front
            </h3>
            <button
              type="button"
              onClick={() => {
                setPickerOpen(false)
                setPickerQuery('')
              }}
              className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </button>
          </header>
          <div className="border-b border-gray-100 px-5 py-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                autoFocus
                value={pickerQuery}
                onChange={(e) => setPickerQuery(e.target.value)}
                placeholder="Search by title, author, or category"
                className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-[#C9A0DC]"
              />
            </div>
          </div>
          {filteredUnfeatured.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-gray-500">
              No articles match — try a different search, or publish a new
              article first.
            </p>
          ) : (
            <ul className="max-h-[420px] divide-y divide-gray-100 overflow-y-auto">
              {filteredUnfeatured.slice(0, 40).map((article) => (
                <li key={article.id}>
                  <button
                    type="button"
                    onClick={() => addFromPicker(article)}
                    disabled={pending}
                    className="flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-amber-50/40 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ArticleThumbnail
                      category={article.category}
                      heroSrc={article.heroSrc}
                      heroAlt={article.heroAlt}
                      heroType={article.heroType}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {article.title || 'Untitled'}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-gray-500">
                        {article.category}
                        {article.authorName
                          ? ` · by ${article.authorName}`
                          : ''}
                      </p>
                    </div>
                    <Plus className="h-4 w-4 shrink-0 text-amber-700" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* ── FEATURED POOL (unpinned but featured) ───────────────────── */}
      {pool.length > 0 && (
        <section className="rounded-2xl border border-gray-100 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
          <header className="border-b border-gray-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-gray-900">
              Featured pool
            </h2>
            <p className="mt-0.5 text-xs text-gray-500">
              These articles are featured but not pinned to a specific slot.
              They fill any unpinned slots in published-date order.
            </p>
          </header>
          <ul className="divide-y divide-gray-100">
            {pool.map((article) => (
              <li
                key={article.id}
                className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-gray-50/60"
              >
                <ArticleThumbnail
                  category={article.category}
                  heroSrc={article.heroSrc}
                  heroAlt={article.heroAlt}
                  heroType={article.heroType}
                />
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/operations/articles/${article.id}`}
                    className="block truncate text-sm font-semibold text-gray-900 hover:text-[#7E5896]"
                  >
                    {article.title || 'Untitled'}
                  </Link>
                  <p className="mt-0.5 truncate text-xs text-gray-500">
                    {article.category}
                    {article.authorName ? ` · by ${article.authorName}` : ''}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => pinFromPool(article.id)}
                    disabled={pending || pinned.length >= maxSlots}
                    title={
                      pinned.length >= maxSlots
                        ? 'All slots full — unpin one first'
                        : 'Pin to a specific slot'
                    }
                    className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Star className="h-3.5 w-3.5" />
                    Pin
                  </button>
                  <button
                    type="button"
                    onClick={() => removeFromFeatured(article.id)}
                    disabled={pending}
                    title="Remove from featured pool entirely"
                    className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:opacity-40"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── HELP TEXT ───────────────────────────────────────────────── */}
      <p className="px-1 text-xs text-gray-500">
        Articles render on the public site at{' '}
        <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[11px]">
          /advice-and-ideas
        </code>
        . Slot 1 = Trending hero (the big image at the top). Slots 2–5 =
        Editor Picks (the row beneath the hero). If fewer than 5 slots are
        filled, the public site auto-fills with the most recent published
        articles.
      </p>
    </div>
  )
}
