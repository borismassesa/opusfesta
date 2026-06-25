import type { PayoutMethod } from './draft'

export type PayoutOption = {
  id: NonNullable<PayoutMethod>
  label: string
  label_sw: string
  hint: string
  hint_sw: string
  numberLabel: string
  numberLabel_sw: string
  numberPlaceholder: string
  prefix?: string
  isMobileMoney: boolean
}

export const PAYOUT_OPTIONS: PayoutOption[] = [
  {
    id: 'mpesa',
    label: 'M-Pesa',
    label_sw: 'M-Pesa',
    hint: 'Vodacom mobile money',
    hint_sw: 'Pesa ya simu ya Vodacom',
    numberLabel: 'M-Pesa number',
    numberLabel_sw: 'Namba ya M-Pesa',
    numberPlaceholder: '754 123 456',
    prefix: '+255',
    isMobileMoney: true,
  },
  {
    id: 'airtel-money',
    label: 'Airtel Money',
    label_sw: 'Airtel Money',
    hint: 'Airtel mobile money',
    hint_sw: 'Pesa ya simu ya Airtel',
    numberLabel: 'Airtel Money number',
    numberLabel_sw: 'Namba ya Airtel Money',
    numberPlaceholder: '784 123 456',
    prefix: '+255',
    isMobileMoney: true,
  },
  {
    id: 'tigopesa',
    label: 'Mixx by Yas',
    label_sw: 'Mixx by Yas',
    hint: 'Formerly Tigo Pesa',
    hint_sw: 'Zamani Tigo Pesa',
    numberLabel: 'Mixx by Yas number',
    numberLabel_sw: 'Namba ya Mixx by Yas',
    numberPlaceholder: '714 123 456',
    prefix: '+255',
    isMobileMoney: true,
  },
  {
    id: 'halopesa',
    label: 'Halopesa',
    label_sw: 'Halopesa',
    hint: 'Halotel mobile money',
    hint_sw: 'Pesa ya simu ya Halotel',
    numberLabel: 'Halopesa number',
    numberLabel_sw: 'Namba ya Halopesa',
    numberPlaceholder: '624 123 456',
    prefix: '+255',
    isMobileMoney: true,
  },
  {
    id: 'lipa-namba',
    label: 'Lipa Namba (Till Number)',
    label_sw: 'Lipa Namba (Namba ya Till)',
    hint: 'Merchant code from M-Pesa, Airtel, Mixx, or Halopesa',
    hint_sw: 'Namba ya mfanyabiashara kutoka M-Pesa, Airtel, Mixx, au Halopesa',
    numberLabel: 'Lipa Namba / Till number',
    numberLabel_sw: 'Lipa Namba / Namba ya till',
    numberPlaceholder: 'e.g. 12 34 56',
    isMobileMoney: false,
  },
  {
    id: 'bank',
    label: 'Bank account',
    label_sw: 'Akaunti ya benki',
    hint: 'NBC, CRDB, NMB, Stanbic, Equity, etc.',
    hint_sw: 'NBC, CRDB, NMB, Stanbic, Equity, n.k.',
    numberLabel: 'Account number',
    numberLabel_sw: 'Namba ya akaunti',
    numberPlaceholder: '0123 4567 8901',
    isMobileMoney: false,
  },
]

export const LIPA_NAMBA_NETWORKS = [
  { id: 'mpesa', label: 'M-Pesa (Vodacom)' },
  { id: 'airtel', label: 'Airtel Money' },
  { id: 'mixx', label: 'Mixx by Yas (Tigo)' },
  { id: 'halopesa', label: 'Halopesa (Halotel)' },
]

export const TZ_BANKS = [
  'CRDB Bank',
  'NMB Bank',
  'NBC',
  'Stanbic Bank',
  'Equity Bank',
  'Absa Bank',
  'Exim Bank',
  'I&M Bank',
  'Bank of Africa',
  'Diamond Trust Bank',
  'KCB Bank',
  'Akiba Commercial Bank',
  'Azania Bank',
  'TPB Bank',
  'Other',
]
