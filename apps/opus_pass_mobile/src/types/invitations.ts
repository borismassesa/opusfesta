export type InvitationProductBadge =
  | 'most_popular'
  | 'premium'
  | 'trending'
  | null;

/** Mirrors the `website_invitations_products` row shape (see apps/opus_pass/src/lib/cms/invitations-products.ts). */
export interface InvitationProduct {
  id: string;
  slug: string;
  name: string;
  designer: string | null;
  category: string;
  price_was: number | null;
  price_now: number;
  digital_unit_price: number | null;
  image_url: string;
  /** Extra designer-uploaded card views shown alongside `image_url` on the detail page. */
  designs: string[] | null;
  description: string | null;
  badge: InvitationProductBadge;
  sort_order: number;
}
