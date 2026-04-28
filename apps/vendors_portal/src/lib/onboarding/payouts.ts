import type { PayoutMethod } from './draft'

export type PayoutOption = {
  id: NonNullable<PayoutMethod>
  label: string
  hint: string
  numberLabel: string
  numberPlaceholder: string
  prefix?: string
  isMobileMoney: boolean
}

export const PAYOUT_OPTIONS: PayoutOption[] = [
  {
    id: 'mpesa',
    label: 'M-Pesa',
    hint: 'Vodacom mobile money',
    numberLabel: 'M-Pesa number',
    numberPlaceholder: '754 123 456',
    prefix: '+255',
    isMobileMoney: true,
  },
  {
    id: 'airtel-money',
    label: 'Airtel Money',
    hint: 'Airtel mobile money',
    numberLabel: 'Airtel Money number',
    numberPlaceholder: '784 123 456',
    prefix: '+255',
    isMobileMoney: true,
  },
  {
    id: 'tigopesa',
    label: 'Mixx by Yas',
    hint: 'Formerly Tigo Pesa',
    numberLabel: 'Mixx by Yas number',
    numberPlaceholder: '714 123 456',
    prefix: '+255',
    isMobileMoney: true,
  },
  {
    id: 'halopesa',
    label: 'Halopesa',
    hint: 'Halotel mobile money',
    numberLabel: 'Halopesa number',
    numberPlaceholder: '624 123 456',
    prefix: '+255',
    isMobileMoney: true,
  },
  {
    id: 'lipa-namba',
    label: 'Lipa Namba (Till Number)',
    hint: 'Merchant code from M-Pesa, Airtel, Mixx, or Halopesa',
    numberLabel: 'Lipa Namba / Till number',
    numberPlaceholder: 'e.g. 12 34 56',
    isMobileMoney: false,
  },
  {
    id: 'bank',
    label: 'Bank account',
    hint: 'NBC, CRDB, NMB, Stanbic, Equity, etc.',
    numberLabel: 'Account number',
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
