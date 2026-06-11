-- CMS-managed vendor categories table.
-- Admins can add/edit/hide categories from the admin app without a code
-- rebuild. The onboarding portal reads active rows at runtime and falls back
-- to the hardcoded list if the query fails.
-- Also converts vendors.category from the legacy enum to a plain text column
-- referencing this table, so new categories added via the admin CMS are
-- immediately accepted.

-- 1) Create the source-of-truth table -----------------------------------------
CREATE TABLE IF NOT EXISTS public.vendor_categories (
  slug         text PRIMARY KEY,
  label        text NOT NULL,
  profile_label text NOT NULL,
  db_value     text NOT NULL UNIQUE,
  icon         text NOT NULL DEFAULT 'Tag',
  sort_order   int  NOT NULL DEFAULT 0,
  active       boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- 2) Seed from the current hardcoded list --------------------------------------
INSERT INTO public.vendor_categories (slug, label, profile_label, db_value, icon, sort_order)
VALUES
  ('venue',         'Venue or event space',  'Venue',        'Venues',          'Building2',     1),
  ('caterer',       'Caterer / Bar services', 'Caterer',      'Caterers',        'ChefHat',       2),
  ('photographer',  'Photographer',           'Photographer', 'Photographers',   'Camera',        3),
  ('cakes',         'Cakes & desserts',       'Cake artist',  'Cake & Desserts', 'Cake',          4),
  ('florist',       'Florist',                'Florist',      'Florists',        'Flower2',       5),
  ('planner',       'Planner / Coordinator',  'Planner',      'Wedding Planners','ClipboardList', 6),
  ('musician',      'Musician / DJ',          'Musician / DJ','DJs & Music',     'Music2',        7),
  ('officiant',     'Officiant',              'Officiant',    'Officiants',      'Heart',         8),
  ('videographer',  'Videographer',           'Videographer', 'Videographers',   'Video',         9),
  ('extras',        'Event extras',           'Event extras', 'Decorators',      'PartyPopper',  10),
  ('beauty',        'Beauty professional',    'Beauty pro',   'Beauty & Makeup', 'Wand2',        11),
  ('other',         'Something else',         'Other',        'Other',           'HelpCircle',   99)
ON CONFLICT (slug) DO NOTHING;

-- 3) RLS -----------------------------------------------------------------------
ALTER TABLE public.vendor_categories ENABLE ROW LEVEL SECURITY;

-- Anyone can read active categories (onboarding portal, website)
CREATE POLICY "vendor_categories_public_read"
  ON public.vendor_categories FOR SELECT
  USING (active = true);

-- Admins (role = 'admin') can do full CRUD
CREATE POLICY "vendor_categories_admin_all"
  ON public.vendor_categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 4) Convert vendors.category from enum to text with FK -----------------------
-- Cast existing enum values to text, then wire up the FK constraint.
ALTER TABLE public.vendors
  ALTER COLUMN category TYPE text USING category::text;

ALTER TABLE public.vendors
  ADD CONSTRAINT vendors_category_fkey
  FOREIGN KEY (category) REFERENCES public.vendor_categories(db_value);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_vendor_categories_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER vendor_categories_updated_at
  BEFORE UPDATE ON public.vendor_categories
  FOR EACH ROW EXECUTE FUNCTION public.set_vendor_categories_updated_at();
