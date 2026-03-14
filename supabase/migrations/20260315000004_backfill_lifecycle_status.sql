-- ============================================================================
-- Backfill existing bookings with lifecycle_status based on current status
-- ============================================================================

-- Map existing status enum values to lifecycle_status:
--   new        → intake_submitted
--   contacted  → qualified
--   quoted     → quote_sent
--   confirmed  → confirmed
--   completed  → completed
--   cancelled  → cancelled

UPDATE studio_bookings
SET lifecycle_status = CASE status
  WHEN 'new'       THEN 'intake_submitted'::studio_booking_lifecycle_status
  WHEN 'contacted' THEN 'qualified'::studio_booking_lifecycle_status
  WHEN 'quoted'    THEN 'quote_sent'::studio_booking_lifecycle_status
  WHEN 'confirmed' THEN 'confirmed'::studio_booking_lifecycle_status
  WHEN 'completed' THEN 'completed'::studio_booking_lifecycle_status
  WHEN 'cancelled' THEN 'cancelled'::studio_booking_lifecycle_status
  ELSE 'intake_submitted'::studio_booking_lifecycle_status
END
WHERE lifecycle_status IS NULL;

-- Set confirmed_at for confirmed bookings
UPDATE studio_bookings
SET confirmed_at = updated_at
WHERE status = 'confirmed' AND confirmed_at IS NULL;

-- Set completed_at for completed bookings
UPDATE studio_bookings
SET completed_at = updated_at
WHERE status = 'completed' AND completed_at IS NULL;

-- Set cancelled_at for cancelled bookings
UPDATE studio_bookings
SET cancelled_at = updated_at
WHERE status = 'cancelled' AND cancelled_at IS NULL;

-- Create audit events for backfilled bookings
INSERT INTO studio_booking_events (booking_id, event_type, to_status, actor_type, metadata)
SELECT
  id,
  'status_change',
  lifecycle_status,
  'system',
  '{"reason": "Backfilled from legacy status column"}'::jsonb
FROM studio_bookings
WHERE id NOT IN (SELECT DISTINCT booking_id FROM studio_booking_events);
