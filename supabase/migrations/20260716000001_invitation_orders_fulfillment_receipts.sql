-- Adds a design-fulfillment status to invitation_orders (used by the admin
-- fulfillment workflow, not yet wired up) and idempotency stamps for the
-- customer receipt / admin new-purchase emails now sent on every payment
-- method (previously Lipa Namba only).

create type invitation_order_fulfillment_status as enum (
  'not_started',
  'in_progress',
  'ready',
  'delivered'
);

alter table invitation_orders
  add column fulfillment_status invitation_order_fulfillment_status not null default 'not_started',
  add column fulfillment_updated_at timestamptz,
  add column fulfillment_updated_by text,
  add column receipt_emailed_at timestamptz,
  add column purchase_notified_at timestamptz;
