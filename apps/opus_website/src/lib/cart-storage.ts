'use client'

const CART_KEY = 'opusfesta:cart'
const ADDRESS_KEY = 'opusfesta:address'
const ORDER_KEY = 'opusfesta:lastOrder'

export type StoredCartItem = {
  category: string
  id: number
  size: string
  color: string
  quantity: number
  selected?: boolean
}

export type FulfilmentMode = 'delivery' | 'fitting' | 'pickup'

export type StoredAddress = {
  mode: FulfilmentMode
  fullName: string
  phone: string
  city: string
  neighbourhood: string
  streetLine: string
  notes: string
}

export type StoredOrder = {
  ref: string
  paidAt: string
  paymentLabel: string
  items: StoredCartItem[]
  subtotal: number
  vat: number
  delivery: number
  total: number
  address: StoredAddress
}

function read<T>(key: string): T | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function write(key: string, value: unknown): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* quota or disabled — ignore */
  }
}

function remove(key: string): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(key)
  } catch {
    /* ignore */
  }
}

function dispatchCartChanged(): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent('opusfesta:cart-changed'))
}

export function getCart(): StoredCartItem[] {
  return read<StoredCartItem[]>(CART_KEY) ?? []
}

export function setCart(items: StoredCartItem[]): void {
  write(CART_KEY, items)
  dispatchCartChanged()
}

export function addToCart(item: StoredCartItem): void {
  const cart = getCart()
  const idx = cart.findIndex(
    (c) =>
      c.category === item.category &&
      c.id === item.id &&
      c.size === item.size &&
      c.color === item.color,
  )
  if (idx >= 0) {
    cart[idx] = { ...cart[idx], quantity: cart[idx].quantity + item.quantity, selected: true }
  } else {
    cart.push({ ...item, selected: true })
  }
  setCart(cart)
}

export function clearCart(): void {
  remove(CART_KEY)
  dispatchCartChanged()
}

export function getAddress(): StoredAddress | null {
  return read<StoredAddress>(ADDRESS_KEY)
}

export function setAddress(addr: StoredAddress): void {
  write(ADDRESS_KEY, addr)
}

export function getLastOrder(): StoredOrder | null {
  return read<StoredOrder>(ORDER_KEY)
}

export function setLastOrder(order: StoredOrder): void {
  write(ORDER_KEY, order)
}

export function generateOrderRef(): string {
  const stamp = new Date()
  const yyyy = stamp.getFullYear()
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `OF-${yyyy}-${rand}`
}
