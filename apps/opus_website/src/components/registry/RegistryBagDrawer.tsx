'use client'

import { X, Gift, Trash2 } from 'lucide-react'
import { removeFromRegistryBag, type RegistryBagItem } from '@/lib/registry-storage'

const OPUSPASS_REGISTRY_HREF = '/opuspass/my/dashboard/gift-registry'

export default function RegistryBagDrawer({
  open,
  items,
  onClose,
}: {
  open: boolean
  items: RegistryBagItem[]
  onClose: () => void
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-sm flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900">
            <Gift size={18} /> Your registry picks
          </h2>
          <button onClick={onClose} aria-label="Close" className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <p className="mt-10 text-center text-sm text-gray-500">
              Nothing here yet — browse the registry and tap “Add to Registry” on anything you’d love.
            </p>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li key={`${item.category}-${item.id}`} className="flex items-center gap-3">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.img} alt={item.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-500">
                      {item.price} · Qty {item.quantity}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFromRegistryBag(item.category, item.id)}
                    aria-label="Remove"
                    className="p-1.5 text-gray-400 hover:text-rose-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-gray-100 px-5 py-4">
            <p className="mb-3 text-xs leading-relaxed text-gray-500">
              These picks are saved on this device. Continue to OpusPass to add them to your live registry so guests
              can see them.
            </p>
            <a
              href={OPUSPASS_REGISTRY_HREF}
              className="flex w-full items-center justify-center rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800"
            >
              Continue to my OpusPass registry
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
