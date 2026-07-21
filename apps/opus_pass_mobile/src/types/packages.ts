export type TierBadgeTone = 'slate' | 'accent' | 'gold';

/** Mirrors apps/opus_pass/src/lib/cms/packages.ts's `TierBadgeIcon` union. */
export type TierBadgeIcon =
  | 'none'
  | 'sparkles'
  | 'star'
  | 'diamond'
  | 'crown'
  | 'gem'
  | 'heart'
  | 'award'
  | 'zap'
  | 'flame'
  | 'party';

export interface PackageBullet {
  id: string;
  label: string;
  note: string;
}

export interface PackageTier {
  id: string;
  name: string;
  featured: boolean;
  price_per_guest: number;
  best_for: string;
  badge_label: string;
  badge_icon: TierBadgeIcon;
  badge_tone: TierBadgeTone;
  includes: PackageBullet[];
}

/** Mirrors apps/opus_pass/src/lib/cms/packages.ts (`PackagesContent`) — one global row, not per-product. */
export interface PackagesContent {
  heading: string;
  subheading: string;
  note: string;
  perGuestLabel: string;
  fromLabel: string;
  cardsCountLabel: string;
  minGuestsTemplate: string;
  includesSuffixLabel: string;
  tiers: PackageTier[];
}
