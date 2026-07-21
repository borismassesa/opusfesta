export type AddOnPricingMode = 'flat' | 'per_unit' | 'quote';

export interface AddOn {
  id: string;
  title: string;
  description: string;
  pricingMode: AddOnPricingMode;

  /** 'flat' mode */
  flatFee: number;
  flatFeeLabel: string;

  /** 'per_unit' mode */
  unitPrice: number;
  unitLabel: string;
  minQty: number;
  qtyStep: number;
  defaultQty: number;

  /** 'quote' mode */
  quoteLabel: string;
  quoteCtaLabel: string;

  /** Free once bundled into one of these package-tier ids (matches PackageTier.id). */
  includedInTierIds: string[];
  includedTitle: string;
  includedDescription: string;

  /** 'flat'-only: show the guest-ticket preview once this add-on is selected. */
  showGuestTicketPreview: boolean;
}

export interface FaqItem {
  id: string;
  title: string;
  /** May contain a literal "{link}" placeholder, filled in with `link_label` when `link_href` is set. */
  body: string;
  link_label: string;
  link_href: string;
}

/** Mirrors apps/opus_pass/src/lib/cms/product-addons-faq.ts (`ProductAddonsFaqContent`) — one global row, not per-product. */
export interface ProductAddonsFaqContent {
  addonsHeading: string;
  includedPillLabel: string;
  priceFromLabel: string;
  howManyLabel: string;
  quotePhoneNumber: string;
  descriptionLabel: string;
  readMoreLabel: string;
  readLessLabel: string;
  similarDesignsHeading: string;
  addons: AddOn[];
  faq: FaqItem[];
}
