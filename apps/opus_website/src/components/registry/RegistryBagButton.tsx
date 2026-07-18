'use client'

import { useState, useSyncExternalStore } from 'react'
import { ShoppingBag } from 'lucide-react'
import { getRegistryBag, getRegistryBagServerSnapshot, subscribeRegistryBag } from '@/lib/registry-storage'
import RegistryBagDrawer from './RegistryBagDrawer'

export default function RegistryBagButton() {
  const items = useSyncExternalStore(subscribeRegistryBag, getRegistryBag, getRegistryBagServerSnapshot)
  const [open, setOpen] = useState(false)

  const count = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Your registry picks"
        className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white hover:bg-white/10"
      >
        <ShoppingBag size={18} />
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[10px] font-bold text-[var(--on-accent)]">
            {count}
          </span>
        )}
      </button>
      <RegistryBagDrawer open={open} items={items} onClose={() => setOpen(false)} />
    </>
  )
}
