-- Entrance-pass ticket personalization at the event level.
--
-- partner1_name / partner2_name: the celebrants' names as the couple wants
-- them on the entrance-pass ticket ("Claudia" & "Daniel" derive from these
-- via firstNameOf). Event-level (not couple_profiles) because a multi-event
-- account can celebrate different people per event (bride's kitchen party,
-- couple's wedding). Null = fall back to the profile/host-name chain.
--
-- ticket_language: which language the rendered ticket image uses for its
-- intro line, Date/Venue labels and date formatting. The WhatsApp message
-- body stays Swahili (its approved Meta template) regardless.
alter table public.wedding_events
  add column if not exists partner1_name text,
  add column if not exists partner2_name text,
  add column if not exists ticket_language text not null default 'en'
    check (ticket_language in ('en', 'sw'));
