/**
 * A couple's `couple_profiles` row (one per user). Columns mirror the
 * onboarding payload written by app/(onboarding)/couple/step10-complete.tsx.
 * The index signature covers the remaining/rarely-read columns so a `select('*')`
 * row can be treated as a CoupleProfile without enumerating every field.
 */
export interface CoupleProfile {
  id: string;
  user_id: string;
  partner1_name: string | null;
  partner2_name: string | null;
  wedding_date: string | null;
  date_undecided: boolean | null;
  budget_range: string | null;
  guest_count: number | null;
  city: string | null;
  region: string | null;
  planning_stage: string | null;
  preferred_categories: string[] | null;
  preferred_styles: string[] | null;
  preferred_designs: string[] | null;
  whatsapp_phone: string | null;
  avatar_url: string | null;
  onboarding_complete: boolean | null;
  website_doc: unknown;
  public_slug: string | null;
  website_published_at: string | null;
  public_sharing_enabled: boolean | null;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}
