-- Per-scene card placement for the mockup carousel.
--
-- Photographic mockups (e.g. a flat-lay with an envelope and a blank card slot)
-- have their card area in a different spot in every photo. The product page used
-- to drop the invitation design dead-center at 62% width, covering the rest of
-- the composition. These columns let an admin position the invitation INTO the
-- photo's card slot per scene; the public render reads them at request time.
--
-- All columns have defaults so existing rows stay valid. The centered defaults
-- (x=50, y=50, width=62, rotate=0) reproduce the previous behaviour for scenes
-- that haven't been tuned yet.

alter table website_cms_mockup_carousel
  add column if not exists card_x      numeric not null default 50,   -- card center X, % of container width
  add column if not exists card_y      numeric not null default 50,   -- card center Y, % of container height
  add column if not exists card_width  numeric not null default 62,   -- card width, % of container width
  add column if not exists card_rotate numeric not null default 0,    -- rotation in degrees
  add column if not exists card_hidden boolean not null default false; -- hide the overlay (mockup already has a printed card)

-- Seed a sensible starting placement for the flat-lay scene to match the
-- right-side, slightly-tilted card slot of the reference photo. Admins fine-tune
-- the rest from the live preview in the CMS editor.
update website_cms_mockup_carousel
  set card_x = 74, card_y = 58, card_width = 34, card_rotate = 2
  where scene = 'flat-lay';

notify pgrst, 'reload schema';
