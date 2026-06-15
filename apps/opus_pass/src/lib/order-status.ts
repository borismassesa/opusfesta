import type { StoredOrder } from '@/lib/cart-storage'

export type OrderStageId = 'payment_review' | 'confirmed' | 'in_design' | 'delivered'

export type OrderStage = {
  id: OrderStageId
  label: string
  description: string
}

// Linear fulfilment for digital invitations. Without an orders backend the
// current stage is derived from how long ago payment was made (24h SLA).
export const ORDER_STAGES: OrderStage[] = [
  {
    id: 'payment_review',
    label: 'Payment under review',
    description: 'The OpusFesta team is confirming your payment',
  },
  { id: 'confirmed', label: 'Order confirmed', description: 'Payment confirmed' },
  { id: 'in_design', label: 'In design', description: 'Our team is personalising your invitation' },
  { id: 'delivered', label: 'Delivered', description: 'Your design and OpusPass tickets are ready' },
]

const HOUR = 1000 * 60 * 60

/** Index of the order's current stage in ORDER_STAGES. */
export function currentStageIndex(order: StoredOrder): number {
  const verifying = order.paymentStatus === 'verifying'
  const paid = new Date(order.paidAt).getTime()
  if (Number.isNaN(paid)) return verifying ? 0 : 2
  const hours = (Date.now() - paid) / HOUR
  if (verifying) return 0 // payment under review until finance approves
  if (hours >= 24) return 3 // delivered
  return 2 // in design
}

export function currentStage(order: StoredOrder): OrderStage {
  return ORDER_STAGES[currentStageIndex(order)]
}

export type OrderStatusTone = 'neutral' | 'amber' | 'emerald'

export function stageTone(id: OrderStageId): OrderStatusTone {
  if (id === 'delivered') return 'emerald'
  if (id === 'in_design' || id === 'payment_review') return 'amber'
  return 'neutral'
}
