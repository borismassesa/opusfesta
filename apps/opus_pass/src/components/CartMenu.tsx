'use client'

import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { useCart } from '@/components/providers/CartProvider'

// Cart trigger in the nav — links straight to the full cart page (/invitations/cart).
// (Replaces the old slide-over mini-cart.)
export default function CartMenu() {
  const { count } = useCart()

  return (
    <Link
      href="/invitations/cart"
      aria-label={`Cart${count ? ` — ${count} item${count > 1 ? 's' : ''}` : ', empty'}`}
      className="relative flex h-10 w-10 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-gray-100"
    >
      <ShoppingBag size={20} />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-(--accent) px-1 text-[11px] font-bold leading-none text-(--on-accent) ring-2 ring-white tabular-nums">
          {count}
        </span>
      )}
    </Link>
  )
}
