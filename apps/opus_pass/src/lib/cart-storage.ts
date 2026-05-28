'use client'

const CONTACT_KEY = 'opuspass.contact.v1'
const ORDER_KEY = 'opuspass.lastOrder.v1'

export type DeliveryMode = 'digital' | 'print'

export type StoredContact = {
  mode: DeliveryMode
  fullName: string
  email: string
  phone: string
  city?: string
  streetLine?: string
  notes?: string
}

export type StoredOrderItem = {
  id: string
  name: string
  summary: string
  total: number
}

export type StoredOrder = {
  ref: string
  paidAt: string
  items: StoredOrderItem[]
  subtotal: number
  vat: number
  total: number
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
    /* quota or private mode — ignore */
  }
}

export function getContact(): StoredContact | null {
  return read<StoredContact>(CONTACT_KEY)
}

export function setContact(contact: StoredContact): void {
  write(CONTACT_KEY, contact)
}

export function getLastOrder(): StoredOrder | null {
  return read<StoredOrder>(ORDER_KEY)
}

function sanitizeOrderForStorage(order: StoredOrder): StoredOrder {
  return {
    ref: order.ref,
    paidAt: order.paidAt,
    items: order.items,
    subtotal: order.subtotal,
    vat: order.vat,
    total: order.total,
  }
}

export function setLastOrder(order: StoredOrder): void {
  write(ORDER_KEY, sanitizeOrderForStorage(order))
}

export function generateOrderRef(): string {
  if (typeof crypto === 'undefined' || !crypto.randomUUID) {
    throw new Error('Web Crypto API not available — cannot generate secure order reference')
  }
  const stamp = new Date()
  const yyyy = stamp.getFullYear()
  const uuid = crypto.randomUUID()
  const token = uuid.replace(/-/g, '').slice(0, 6).toUpperCase()
  return `OF-${yyyy}-${token}`
}
