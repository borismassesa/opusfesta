-- Add 'Other' to the vendor_category enum so vendors who select the custom
-- "Something else" path can be persisted. ADD VALUE cannot run inside the
-- same transaction block as statements that use the new value, so it lives
-- in its own migration file.
ALTER TYPE vendor_category ADD VALUE IF NOT EXISTS 'Other';
