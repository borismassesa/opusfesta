import type { CancellationLevel, ReschedulePolicy } from './draft'

export type CancellationOption = {
  id: NonNullable<CancellationLevel>
  label: string
  label_sw: string
  body: string
  body_sw: string
  schedule: string[]
  schedule_sw: string[]
}

export const CANCELLATION_OPTIONS: CancellationOption[] = [
  {
    id: 'flexible',
    label: 'Flexible',
    label_sw: 'Rahisi',
    body: 'Best for vendors with low fixed costs per booking.',
    body_sw: 'Inafaa kwa watoa huduma wenye gharama ndogo za kudumu kwa kila ukataji.',
    schedule: [
      '100% refund up to 30 days before the event',
      '50% refund up to 14 days before',
      'Deposit only inside 14 days',
    ],
    schedule_sw: [
      'Marejesho 100% hadi siku 30 kabla ya tukio',
      'Marejesho 50% hadi siku 14 kabla',
      'Amana pekee ndani ya siku 14',
    ],
  },
  {
    id: 'moderate',
    label: 'Moderate',
    label_sw: 'Wastani',
    body: 'Most common for photographers, planners, and DJs.',
    body_sw: 'Inayotumika zaidi kwa wapiga picha, wapangaji, na DJs.',
    schedule: [
      '100% refund up to 60 days before',
      '50% refund up to 30 days before',
      'Deposit only inside 30 days',
    ],
    schedule_sw: [
      'Marejesho 100% hadi siku 60 kabla',
      'Marejesho 50% hadi siku 30 kabla',
      'Amana pekee ndani ya siku 30',
    ],
  },
  {
    id: 'strict',
    label: 'Strict',
    label_sw: 'Kali',
    body: 'For venues and caterers with significant prep costs.',
    body_sw: 'Kwa kumbi na wapishi wenye gharama kubwa za maandalizi.',
    schedule: [
      '50% refund up to 90 days before',
      'Deposit only inside 90 days',
      'No refunds inside 60 days',
    ],
    schedule_sw: [
      'Marejesho 50% hadi siku 90 kabla',
      'Amana pekee ndani ya siku 90',
      'Hakuna marejesho ndani ya siku 60',
    ],
  },
]

export type RescheduleOption = {
  id: NonNullable<ReschedulePolicy>
  label: string
  label_sw: string
  body: string
  body_sw: string
}

export const RESCHEDULE_OPTIONS: RescheduleOption[] = [
  {
    id: 'unlimited',
    label: 'Unlimited free reschedules',
    label_sw: 'Kuahirisha bila kikomo bure',
    body: 'Couples can move the date whenever, subject to your availability.',
    body_sw: 'Wanandoa wanaweza kuhamisha tarehe wakati wowote, kulingana na upatikanaji wako.',
  },
  {
    id: 'one-free',
    label: 'One free reschedule',
    label_sw: 'Kuahirisha bure mara moja',
    body: 'First date change is free; further changes incur a 10% rebooking fee.',
    body_sw: 'Mabadiliko ya kwanza ya tarehe ni bure; mabadiliko mengine yana ada ya 10% ya kuhifadhi upya.',
  },
  {
    id: 'none',
    label: 'No reschedules',
    label_sw: 'Hakuna kuahirisha',
    body: 'Date changes treated as a cancellation + new booking. Best for venues.',
    body_sw: 'Mabadiliko ya tarehe huchukuliwa kama kughairi + ukataji mpya. Inafaa kwa kumbi.',
  },
]

export const DEPOSIT_PRESETS = ['10', '20', '30', '50']
