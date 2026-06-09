'use client'

import type { Treatment } from '@/components/guests/InvitationVisual'

const CONTACT_KEY = 'opuspass.contact.v1'
const ORDER_KEY = 'opuspass.lastOrder.v1'
const ORDERS_KEY = 'opuspass.orders.v1'
const ORDERS_MAX = 50

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
  /** Visual treatment for rendering a thumbnail on the confirmation page. */
  treatment?: Treatment
  /** Structured fields so the confirmation row mirrors the cart line item. */
  tier?: string
  tierId?: string
  guests?: number
  addOns?: string[]
}

export type StoredOrderContact = {
  name?: string
  email: string
  phone: string
}

export type StoredOrder = {
  ref: string
  paidAt: string
  /** Wedding/event date (ISO), when known — surfaced on the invoice. */
  eventDate?: string
  paymentLabel?: string
  contact: StoredOrderContact
  items: StoredOrderItem[]
  subtotal: number
  discount: number
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
    eventDate: order.eventDate,
    paymentLabel: order.paymentLabel,
    contact: order.contact,
    items: order.items,
    subtotal: order.subtotal,
    discount: order.discount,
    total: order.total,
  }
}

export function setLastOrder(order: StoredOrder): void {
  const clean = sanitizeOrderForStorage(order)
  write(ORDER_KEY, clean)
  // Maintain a newest-first order history (deduped by ref, capped).
  const history = getOrders().filter((o) => o.ref !== clean.ref)
  write(ORDERS_KEY, [clean, ...history].slice(0, ORDERS_MAX))
}

/** All past orders, newest first. */
export function getOrders(): StoredOrder[] {
  return read<StoredOrder[]>(ORDERS_KEY) ?? []
}

export function getOrder(ref: string): StoredOrder | undefined {
  return getOrders().find((o) => o.ref === ref)
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
