'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, Clock, Trash2, ChevronDown, ShieldCheck } from 'lucide-react'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import CheckoutStepper from '@/components/attire-and-rings/CheckoutStepper'
import { generateProduct, type Product } from '@/lib/bridal-products'

type CartItem = {
  product: Product
  size: string
  quantity: number
  selected: boolean
}

const DEMO_REFS: { category: string; id: number; size: string }[] = [
  { category: 'wedding-dresses', id: 0, size: 'M' },
  { category: 'engagement-rings', id: 2, size: '7' },
  { category: 'bridal-shoes', id: 4, size: '38' },
]

const INITIAL_ITEMS: CartItem[] = DEMO_REFS.flatMap((r) => {
  const p = generateProduct(r.category, r.id)
  return p ? [{ product: p, size: r.size, quantity: 1, selected: true }] : []
})

function formatTzs(n: number): string {
  return `TZS ${n.toLocaleString('en-US')}`
}

function PaymentChips() {
  const chips: { label: string; bg: string; fg: string }[] = [
    { label: 'M-Pesa', bg: '#dcfce7', fg: '#166534' },
    { label: 'Airtel', bg: '#fee2e2', fg: '#991b1b' },
    { label: 'Tigo', bg: '#dbeafe', fg: '#1e3a8a' },
    { label: 'Card', bg: '#f3f4f6', fg: '#1f2937' },
  ]
  return (
    <div className="flex items-center gap-1.5">
      {chips.map((c) => (
        <span
          key={c.label}
          className="px-2 py-1 rounded text-[10px] font-bold tracking-wide uppercase"
          style={{ backgroundColor: c.bg, color: c.fg }}
        >
          {c.label}
        </span>
      ))}
    </div>
  )
}

function CartRow({
  item,
  onToggle,
  onQty,
  onRemove,
}: {
  item: CartItem
  onToggle: () => void
  onQty: (q: number) => void
  onRemove: () => void
}) {
  const { product, size, quantity, selected } = item
  return (
    <div className="flex items-center gap-4 py-5">
      <div className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-gray-100">
        <img src={product.img} alt={product.name} className="w-full h-full object-cover" />
        <button
          type="button"
          onClick={onToggle}
          aria-label={selected ? 'Deselect item' : 'Select item'}
          aria-pressed={selected}
          className={`absolute top-2 left-2 w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
            selected ? 'bg-gray-900 text-white' : 'bg-white text-transparent border border-gray-300 hover:border-gray-500'
          }`}
        >
          {selected && <Check size={14} />}
        </button>
      </div>

      <div className="flex-1 min-w-0">
        <Link
          href={`/attire-and-rings/bridal-collection/${product.category.slug}/p/${product.id}`}
          className="text-sm font-semibold text-gray-900 hover:underline line-clamp-1"
        >
          {product.name}
        </Link>
        <p className="text-xs text-gray-600 mt-0.5">Size: {size}</p>
        <p className="text-xs text-gray-500 mt-2 inline-flex items-center gap-1">
          <Clock size={12} /> 30-day exchange available
        </p>
      </div>

      <div className="relative shrink-0 hidden sm:block">
        <select
          value={quantity}
          onChange={(e) => onQty(Number(e.target.value))}
          aria-label="Quantity"
          className="h-9 w-[76px] appearance-none rounded-md border border-gray-300 bg-white px-3 pr-7 text-sm font-medium text-gray-900 focus:outline-none focus:border-gray-500"
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
      </div>

      <span className="font-bold text-gray-900 text-sm w-28 text-right shrink-0">
        {formatTzs(product.priceTzs * quantity)}
      </span>

      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${product.name} from cart`}
        className="shrink-0 text-gray-400 hover:text-red-600 transition-colors"
      >
        <Trash2 size={18} />
      </button>
    </div>
  )
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>(INITIAL_ITEMS)
  const [coupon, setCoupon] = useState('')
  const [couponMessage, setCouponMessage] = useState<string | null>(null)

  const removeItem = (id: number) => setItems((prev) => prev.filter((i) => i.product.id !== id))
  const updateQty = (id: number, qty: number) =>
    setItems((prev) => prev.map((i) => (i.product.id === id ? { ...i, quantity: qty } : i)))
  const toggleSelect = (id: number) =>
    setItems((prev) => prev.map((i) => (i.product.id === id ? { ...i, selected: !i.selected } : i)))

  const selectedItems = items.filter((i) => i.selected)
  const subtotal = selectedItems.reduce((s, i) => s + i.product.priceTzs * i.quantity, 0)
  const vat = Math.round(subtotal * 0.18)
  const total = subtotal + vat

  const applyCoupon = () => {
    const code = coupon.trim()
    if (!code) {
      setCouponMessage('Enter a code first.')
      return
    }
    setCouponMessage(`Sorry, "${code}" isn't a valid code right now.`)
  }

  return (
    <>
      <Navbar />
      <main className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <Link
            href="/attire-and-rings/bridal-collection"
            className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 mb-4"
          >
            ← Continue shopping
          </Link>
          <CheckoutStepper current="cart" />
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 lg:gap-8">
            {/* LEFT — Cart items */}
            <section>
              <div className="flex items-end justify-between mb-5">
                <h1 className="text-2xl font-bold text-gray-900">Your Cart</h1>
                <p className="text-sm text-gray-600">
                  {items.length} {items.length === 1 ? 'item' : 'items'} in cart
                </p>
              </div>

              <div className="rounded-2xl bg-white border border-gray-200 px-5">
                {items.length === 0 ? (
                  <div className="py-14 text-center">
                    <p className="text-sm font-semibold text-gray-700">Your cart is empty.</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Saved pieces from your wishlist will move here when you check out.
                    </p>
                    <Link
                      href="/attire-and-rings/bridal-collection"
                      className="mt-4 inline-block rounded-full bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition"
                    >
                      Browse the collection
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {items.map((item) => (
                      <CartRow
                        key={item.product.id}
                        item={item}
                        onToggle={() => toggleSelect(item.product.id)}
                        onQty={(q) => updateQty(item.product.id, q)}
                        onRemove={() => removeItem(item.product.id)}
                      />
                    ))}
                  </div>
                )}
              </div>

            </section>

            {/* RIGHT — Sidebar */}
            <aside className="space-y-5">
              {/* Apply Coupon */}
              <div className="rounded-2xl bg-white border border-gray-200 p-5">
                <h2 className="text-lg font-bold text-gray-900 mb-1">Apply Coupon</h2>
                <p className="text-sm text-gray-600 mb-4">Using a promo code?</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={coupon}
                    onChange={(e) => {
                      setCoupon(e.target.value)
                      setCouponMessage(null)
                    }}
                    placeholder="Coupon code"
                    className="flex-1 h-10 rounded-md border border-gray-200 px-3 text-sm focus:outline-none focus:border-gray-500"
                  />
                  <button
                    type="button"
                    onClick={applyCoupon}
                    className="h-10 px-5 bg-gray-900 text-white text-sm font-semibold rounded-md hover:bg-gray-800 transition"
                  >
                    Apply
                  </button>
                </div>
                {couponMessage && (
                  <p className="mt-2 text-xs text-gray-500">{couponMessage}</p>
                )}
              </div>

              {/* Price Details */}
              <div className="rounded-2xl bg-white border border-gray-200 p-5">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Price Details</h2>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-700">Subtotal</dt>
                    <dd className="font-medium text-gray-900">{formatTzs(subtotal)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-700">
                      VAT <span className="text-gray-500">18%</span>
                    </dt>
                    <dd className="font-medium text-gray-900">+{formatTzs(vat)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-700">Shipping</dt>
                    <dd className="font-medium text-emerald-700">Free in Dar es Salaam</dd>
                  </div>
                </dl>

                <div className="border-t border-gray-200 my-4" />

                <div className="flex justify-between items-baseline mb-5">
                  <span className="text-base font-bold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-gray-900">{formatTzs(total)}</span>
                </div>

                <Link
                  href={selectedItems.length === 0 ? '#' : '/attire-and-rings/address'}
                  aria-disabled={selectedItems.length === 0}
                  className={`w-full h-11 inline-flex items-center justify-center font-semibold rounded-md transition ${
                    selectedItems.length === 0
                      ? 'bg-gray-300 text-white cursor-not-allowed pointer-events-none'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  Continue to address
                </Link>

                <div className="mt-4 flex items-center justify-between gap-3 text-xs text-gray-600">
                  <span className="font-medium">We accept:</span>
                  <PaymentChips />
                </div>
              </div>

              {items.length > 0 && (
                <p className="flex items-center justify-center gap-1.5 text-xs text-gray-600">
                  <ShieldCheck size={13} className="text-emerald-600" />
                  Secure checkout · payments held until pickup
                </p>
              )}
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
