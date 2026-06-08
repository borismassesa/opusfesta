'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { Treatment } from '@/components/guests/InvitationVisual'

export type CartItem = {
  /** Product id — one line per design; re-adding the same design replaces it. */
  id: string
  name: string
  designer: string
  treatment: Treatment
  /** Short config summary, e.g. "Digital cards · 150 guests" (fallback for list views). */
  summary: string
  /** Structured config — used to render a clean breakdown in the cart. */
  tier?: string
  /** Tier id (lite/classic/signature) — drives the package pill colour. */
  tierId?: string
  guests?: number
  addOns?: string[]
  /** Line total in TZS. */
  total: number
}

type CartContextValue = {
  items: CartItem[]
  count: number
  subtotal: number
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  clear: () => void
}

// v2: cart items now carry structured tier/guests/addOns (not just a summary string).
// Bumping the key invalidates v1 carts so stale-shape items don't linger.
const STORAGE_KEY = 'opuspass.cart.v2'

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  // Hydrate from localStorage after mount (avoids SSR/client mismatch).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setItems(JSON.parse(raw) as CartItem[])
    } catch {
      // Corrupt or unavailable storage — start with an empty cart.
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // Ignore persistence failures (private mode, quota, etc.).
    }
  }, [items])

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      const without = prev.filter((i) => i.id !== item.id)
      return [...without, item]
    })
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: items.length,
      subtotal: items.reduce((sum, i) => sum + i.total, 0),
      addItem,
      removeItem,
      clear,
    }),
    [items, addItem, removeItem, clear],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within a CartProvider')
  return ctx
}
