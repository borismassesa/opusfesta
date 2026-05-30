-- Add editable label and sort_order to the mockup carousel CMS table.
-- label   — designer-controlled display name shown in the scene badge; null means fall back to the scene ID.
-- sort_order — controls the order scenes appear in the carousel.

alter table website_cms_mockup_carousel
  add column if not exists label text,
  add column if not exists sort_order int not null default 0;

-- Set default sort_order for the five seeded scenes.
update website_cms_mockup_carousel set sort_order = 0 where scene = 'flat-lay';
update website_cms_mockup_carousel set sort_order = 1 where scene = 'dark-studio';
update website_cms_mockup_carousel set sort_order = 2 where scene = 'paper-stack';
update website_cms_mockup_carousel set sort_order = 3 where scene = 'envelope';
update website_cms_mockup_carousel set sort_order = 4 where scene = 'phone';
