-- Gift registry — atomic multi-unit claim.
--
-- claimGiftRegistryItem's quantity_requested > 1 branch previously did
-- count-existing -> insert -> count-again -> delete-if-over across three
-- separate round trips with no row lock, so concurrent claims on the last
-- unit could all pass the initial count check, all insert, and then each
-- independently see the gift over-claimed and delete its OWN row — wiping
-- out legitimate claims instead of just the excess ones.
--
-- This function does the same check-then-insert inside one transaction,
-- locking the item row first (SELECT ... FOR UPDATE) so concurrent callers
-- serialize on that lock instead of racing.

CREATE OR REPLACE FUNCTION public.claim_gift_registry_unit(
  p_item_id uuid,
  p_user_id uuid,
  p_guest_name text,
  p_guest_phone text,
  p_guest_email text
)
RETURNS uuid
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  v_quantity_requested int;
  v_current_count int;
  v_claim_id uuid;
BEGIN
  SELECT quantity_requested INTO v_quantity_requested
    FROM gift_registry_items
   WHERE id = p_item_id
   FOR UPDATE;

  IF v_quantity_requested IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT count(*) INTO v_current_count
    FROM gift_registry_claims
   WHERE item_id = p_item_id;

  IF v_current_count >= v_quantity_requested THEN
    RETURN NULL;
  END IF;

  INSERT INTO gift_registry_claims (item_id, user_id, guest_name, guest_phone, guest_email)
  VALUES (p_item_id, p_user_id, p_guest_name, p_guest_phone, p_guest_email)
  RETURNING id INTO v_claim_id;

  RETURN v_claim_id;
END;
$$;

COMMENT ON FUNCTION public.claim_gift_registry_unit(uuid, uuid, text, text, text) IS
  'Atomically claims one unit of a multi-quantity gift registry item — locks the item row so concurrent claims serialize instead of racing. Returns the new claim id, or NULL if the gift is already fully claimed.';
