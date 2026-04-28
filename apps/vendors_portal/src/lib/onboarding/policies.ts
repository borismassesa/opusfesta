import type { CancellationLevel, ReschedulePolicy } from './draft'

export type CancellationOption = {
  id: NonNullable<CancellationLevel>
  label: string
  body: string
  schedule: string[]
}

export const CANCELLATION_OPTIONS: CancellationOption[] = [
  {
    id: 'flexible',
    label: 'Flexible',
    body: 'Best for vendors with low fixed costs per booking.',
    schedule: [
      '100% refund up to 30 days before the event',
      '50% refund up to 14 days before',
      'Deposit only inside 14 days',
    ],
  },
  {
    id: 'moderate',
    label: 'Moderate',
    body: 'Most common for photographers, planners, and DJs.',
    schedule: [
      '100% refund up to 60 days before',
      '50% refund up to 30 days before',
      'Deposit only inside 30 days',
    ],
  },
  {
    id: 'strict',
    label: 'Strict',
    body: 'For venues and caterers with significant prep costs.',
    schedule: [
      '50% refund up to 90 days before',
      'Deposit only inside 90 days',
      'No refunds inside 60 days',
    ],
  },
]

export type RescheduleOption = {
  id: NonNullable<ReschedulePolicy>
  label: string
  body: string
}

export const RESCHEDULE_OPTIONS: RescheduleOption[] = [
  {
    id: 'unlimited',
    label: 'Unlimited free reschedules',
    body: 'Couples can move the date whenever, subject to your availability.',
  },
  {
    id: 'one-free',
    label: 'One free reschedule',
    body: 'First date change is free; further changes incur a 10% rebooking fee.',
  },
  {
    id: 'none',
    label: 'No reschedules',
    body: 'Date changes treated as a cancellation + new booking. Best for venues.',
  },
]

export const DEPOSIT_PRESETS = ['10', '20', '30', '50']
