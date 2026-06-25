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

// The service-market catalogue is shared across the portal, public marketplace,
// and admin tools, so it lives in @opusfesta/lib. Re-exported here so the many
// existing `from '@/lib/onboarding/regions'` imports keep working unchanged.
export { SERVICE_MARKETS, marketLabel, type ServiceMarket } from '@opusfesta/lib'

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
