import type { StoredOrder } from '@/lib/cart-storage'

export type OrderStageId = 'payment_review' | 'confirmed' | 'in_design' | 'ready' | 'delivered'

export type OrderStage = {
  id: OrderStageId
  label: string
  description: string
}

// Mirrors invitation_orders.status (payment_review) and
// invitation_orders.fulfillment_status (confirmed/in_design/ready/delivered
// = not_started/in_progress/ready/delivered) — see currentStageIndex.
export const ORDER_STAGES: OrderStage[] = [
  {
    id: 'payment_review',
    label: 'Payment under review',
    description: 'The OpusFesta team is confirming your payment',
  },
  { id: 'confirmed', label: 'Order confirmed', description: 'Payment confirmed' },
  { id: 'in_design', label: 'In design', description: 'Our team is personalising your invitation' },
  { id: 'ready', label: 'Design ready', description: 'Your design is ready' },
  { id: 'delivered', label: 'Delivered', description: 'Your design and OpusPass tickets are ready' },
]

/** Index of the order's current stage in ORDER_STAGES, driven by the real
 *  payment status + fulfillment_status set by the admin team — not a
 *  time-based guess. `fulfillmentStatus` is undefined for orders fetched
 *  before this field existed; treat that the same as 'not_started'. */
export function currentStageIndex(order: StoredOrder): number {
  if (order.paymentStatus !== 'paid') return 0 // payment_review
  switch (order.fulfillmentStatus) {
    case 'in_progress':
      return 2 // in_design
    case 'ready':
      return 3
    case 'delivered':
      return 4
    case 'not_started':
    default:
      return 1 // confirmed
  }
}

export function currentStage(order: StoredOrder): OrderStage {
  return ORDER_STAGES[currentStageIndex(order)]
}

export type OrderStatusTone = 'neutral' | 'amber' | 'emerald'

export function stageTone(id: OrderStageId): OrderStatusTone {
  if (id === 'delivered') return 'emerald'
  if (id === 'in_design' || id === 'ready' || id === 'payment_review') return 'amber'
  return 'neutral'
}
