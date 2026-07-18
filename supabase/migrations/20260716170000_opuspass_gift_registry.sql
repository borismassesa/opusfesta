-- OpusPass gift registry — couple-curated list of gifts guests can reserve.
--
-- Mirrors the guestbook feature's shape: couple-scoped (not per-event, since
-- a registry is shared across the whole wedding regardless of how many
-- ceremonies there are), shares the couple's existing public_slug /
-- public_sharing_enabled gate (the same one /i/<slug> and /guestbook/<slug>
-- use) rather than minting a new token, and public claims go through a
-- trusted server action using the service-role client — no public RLS grant.

CREATE TABLE IF NOT EXISTS gift_registry_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  -- Free-text like the wedding_website reference ("TZS 250,000" or "Any
  -- amount") rather than a numeric column — registries mix priced items with
  -- open contributions (e.g. a honeymoon fund).
  price_label TEXT,
  -- Optional URL to the actual product (Jumia/Amazon/etc.) guests can buy from.
  product_link TEXT,

  claimed_by_name TEXT,
  claimed_at TIMESTAMPTZ,

  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gift_registry_items_user_id ON gift_registry_items(user_id);
CREATE INDEX IF NOT EXISTS idx_gift_registry_items_user_sort
  ON gift_registry_items(user_id, sort_order, created_at);

DROP TRIGGER IF EXISTS trg_gift_registry_items_updated_at ON gift_registry_items;
CREATE TRIGGER trg_gift_registry_items_updated_at
  BEFORE UPDATE ON gift_registry_items FOR EACH ROW
  EXECUTE FUNCTION set_updated_at_timestamp();

-- RLS: owner-only. Public claims go through claimGiftRegistryItem in
-- apps/opus_pass/src/lib/dashboard/actions.ts (service-role client, scoped
-- by resolving the couple from the public slug first).
ALTER TABLE gift_registry_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS gift_registry_items_owner ON gift_registry_items;
CREATE POLICY gift_registry_items_owner ON gift_registry_items
  FOR ALL USING (requesting_user_id() = user_id)
  WITH CHECK (requesting_user_id() = user_id);

-- Storage bucket for couple-uploaded gift photos. Public read (so images
-- render on the public registry page), service-role write only (uploads go
-- through the dashboard's uploadGiftRegistryImage server action).
INSERT INTO storage.buckets (id, name, public)
VALUES ('gift-registry-images', 'gift-registry-images', true)
ON CONFLICT (id) DO UPDATE SET public = excluded.public;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'public_read_gift_registry_images'
  ) THEN
    CREATE POLICY "public_read_gift_registry_images" ON storage.objects
      FOR SELECT
      USING (bucket_id = 'gift-registry-images');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'service_role_all_gift_registry_images'
  ) THEN
    CREATE POLICY "service_role_all_gift_registry_images" ON storage.objects
      FOR ALL TO service_role
      USING (bucket_id = 'gift-registry-images')
      WITH CHECK (bucket_id = 'gift-registry-images');
  END IF;
END $$;

-- Extend the notifications type CHECK so hosts get a bell notification when a
-- guest claims a gift (mirrors 'guestbook_received' / 'rsvp_received').
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check
  CHECK (type IN ('rsvp_received', 'pledge_received', 'payment_confirmed', 'guestbook_received', 'gift_claimed', 'system'));

NOTIFY pgrst, 'reload schema';
