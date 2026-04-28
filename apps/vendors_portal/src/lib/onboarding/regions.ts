export type TanzaniaRegion = {
  code: string
  name: string
}

export const TZ_REGIONS: TanzaniaRegion[] = [
  { code: 'DSM', name: 'Dar es Salaam' },
  { code: 'ARU', name: 'Arusha' },
  { code: 'KIL', name: 'Kilimanjaro' },
  { code: 'MWA', name: 'Mwanza' },
  { code: 'DOD', name: 'Dodoma' },
  { code: 'MBE', name: 'Mbeya' },
  { code: 'MOR', name: 'Morogoro' },
  { code: 'TAN', name: 'Tanga' },
  { code: 'IRI', name: 'Iringa' },
  { code: 'TAB', name: 'Tabora' },
  { code: 'PWA', name: 'Pwani (Coast)' },
  { code: 'ZAN', name: 'Unguja (Zanzibar)' },
  { code: 'PEM', name: 'Pemba' },
  { code: 'SHI', name: 'Shinyanga' },
  { code: 'KAG', name: 'Kagera' },
  { code: 'MAR', name: 'Mara' },
  { code: 'MAN', name: 'Manyara' },
  { code: 'SIN', name: 'Singida' },
  { code: 'RUK', name: 'Rukwa' },
  { code: 'RUV', name: 'Ruvuma' },
  { code: 'LIN', name: 'Lindi' },
  { code: 'MTW', name: 'Mtwara' },
  { code: 'KAT', name: 'Katavi' },
  { code: 'GEI', name: 'Geita' },
  { code: 'NJO', name: 'Njombe' },
  { code: 'SIM', name: 'Simiyu' },
  { code: 'SON', name: 'Songwe' },
]

export type ServiceMarket = {
  id: string
  name: string
  hint: string
}

export const SERVICE_MARKETS: ServiceMarket[] = [
  { id: 'dar', name: 'Dar es Salaam', hint: 'City + Pwani coast' },
  { id: 'zanzibar', name: 'Zanzibar', hint: 'Unguja + Pemba' },
  { id: 'arusha', name: 'Arusha & Kilimanjaro', hint: 'Northern circuit' },
  { id: 'mwanza', name: 'Mwanza & Lake Zone', hint: 'Mwanza, Mara, Kagera' },
  { id: 'dodoma', name: 'Dodoma & Central', hint: 'Dodoma, Singida, Manyara' },
  { id: 'mbeya', name: 'Mbeya & Southern Highlands', hint: 'Mbeya, Iringa, Njombe' },
  { id: 'south', name: 'Southern Coast', hint: 'Lindi, Mtwara, Ruvuma' },
  { id: 'morogoro', name: 'Morogoro & Tanga', hint: 'Eastern interior' },
]

const HOME_MARKET_BY_REGION: Record<string, string> = {
  DSM: 'dar',
  PWA: 'dar',
  ZAN: 'zanzibar',
  PEM: 'zanzibar',
  ARU: 'arusha',
  KIL: 'arusha',
  MWA: 'mwanza',
  MAR: 'mwanza',
  KAG: 'mwanza',
  GEI: 'mwanza',
  SHI: 'mwanza',
  SIM: 'mwanza',
  DOD: 'dodoma',
  SIN: 'dodoma',
  MAN: 'dodoma',
  TAB: 'dodoma',
  KAT: 'dodoma',
  MBE: 'mbeya',
  IRI: 'mbeya',
  NJO: 'mbeya',
  RUK: 'mbeya',
  SON: 'mbeya',
  LIN: 'south',
  MTW: 'south',
  RUV: 'south',
  MOR: 'morogoro',
  TAN: 'morogoro',
}

export function homeMarketForRegion(regionCode: string | null | undefined): string {
  if (!regionCode) return 'dar'
  return HOME_MARKET_BY_REGION[regionCode] ?? 'dar'
}
