-- The WhatsApp invitation template's image header, and the preview card that
-- rides a shared invite link, were two different pictures: the header used the
-- paid card's hero artwork (wedding_invitation_orders.items[].image) while the
-- link preview was a composed OG card built from the couple's cover photo. A
-- guest who got the WhatsApp template and a guest who was forwarded the link
-- saw different art for the same invitation.
--
-- One image per event settles it. Couples upload it in the invitation console;
-- when set it becomes BOTH the template header and the og:image for
-- /rsvp/event/<slug> and /save-the-date/<slug>. NULL keeps every existing
-- fallback (paid card hero → generated OG card), so nothing changes for a
-- couple who never uploads one.
--
-- Meta only accepts JPEG/PNG for a template image header, so the upload action
-- rejects anything else — this column always holds a public https URL to a
-- still image, never a video like pledge_page.coverImageUrl may.
ALTER TABLE wedding_events
  ADD COLUMN IF NOT EXISTS invite_preview_image_url TEXT;

COMMENT ON COLUMN wedding_events.invite_preview_image_url IS
  'Public URL of the invitation preview image: WhatsApp template header + og:image for this event''s shared invite link. NULL falls back to the paid card hero / generated OG card.';

NOTIFY pgrst, 'reload schema';
