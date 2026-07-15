/** A card design pulled from the invitation catalog, offered as a
 *  ready-made pledge-page cover (see `pledgeCardCatalog` in pledges/page.tsx,
 *  built from `loadInvitationProducts()`). */
export interface PledgeCardCatalogItem {
  id: string
  name: string
  imageUrl: string
}

/** Package tiers (ids from packages.ts) that browse the catalog for free. */
export const PLEDGE_TEMPLATE_FREE_TIER_IDS = ['elegant', 'signature']

/** Flat one-time fee (TZS) offered to Classic/Essential couples to unlock the picker. */
export const PLEDGE_TEMPLATE_UNLOCK_FEE = 15000
