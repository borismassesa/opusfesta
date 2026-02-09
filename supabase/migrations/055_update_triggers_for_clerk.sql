-- Migration 055: Update trigger functions to use requesting_user_id() instead of auth.uid()

-- 1. CMS pages audit trigger
CREATE OR REPLACE FUNCTION set_cms_pages_audit()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  IF requesting_user_id() IS NOT NULL THEN
    NEW.updated_by = requesting_user_id();
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.published AND NEW.published_at IS NULL THEN
      NEW.published_at = now();
      IF requesting_user_id() IS NOT NULL THEN
        NEW.published_by = requesting_user_id();
      END IF;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.published
      AND (
        NEW.published IS DISTINCT FROM OLD.published
        OR NEW.published_content IS DISTINCT FROM OLD.published_content
      )
    THEN
      NEW.published_at = now();
      IF requesting_user_id() IS NOT NULL THEN
        NEW.published_by = requesting_user_id();
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- 2. CMS page version logging trigger
CREATE OR REPLACE FUNCTION log_cms_page_version()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.draft_content IS NOT NULL THEN
      INSERT INTO cms_page_versions (page_id, slug, version_type, content, created_by)
      VALUES (NEW.id, NEW.slug, 'draft', NEW.draft_content, requesting_user_id());
    END IF;

    IF NEW.published_content IS NOT NULL AND NEW.published THEN
      INSERT INTO cms_page_versions (page_id, slug, version_type, content, created_by)
      VALUES (NEW.id, NEW.slug, 'published', NEW.published_content, requesting_user_id());
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.draft_content IS DISTINCT FROM OLD.draft_content THEN
      INSERT INTO cms_page_versions (page_id, slug, version_type, content, created_by)
      VALUES (NEW.id, NEW.slug, 'draft', NEW.draft_content, requesting_user_id());
    END IF;

    IF NEW.published_content IS DISTINCT FROM OLD.published_content THEN
      INSERT INTO cms_page_versions (page_id, slug, version_type, content, created_by)
      VALUES (NEW.id, NEW.slug, 'published', NEW.published_content, requesting_user_id());
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- 3. Application status change logging - use requesting_user_id() with session variable fallback
CREATE OR REPLACE FUNCTION log_application_status_change()
RETURNS TRIGGER AS $$
DECLARE
  user_id UUID;
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    BEGIN
      user_id := COALESCE(
        requesting_user_id(),
        NULLIF(current_setting('app.current_user_id', TRUE), '')::UUID
      );
    EXCEPTION WHEN OTHERS THEN
      user_id := requesting_user_id();
    END;

    INSERT INTO application_activity_log (
      application_id, action_type, action_details, performed_by, performed_at
    ) VALUES (
      NEW.id,
      'status_changed',
      jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status),
      user_id,
      CURRENT_TIMESTAMP
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Application note change logging
CREATE OR REPLACE FUNCTION log_application_note_change()
RETURNS TRIGGER AS $$
DECLARE
  user_id UUID;
BEGIN
  IF OLD.notes IS DISTINCT FROM NEW.notes THEN
    BEGIN
      user_id := COALESCE(
        requesting_user_id(),
        NULLIF(current_setting('app.current_user_id', TRUE), '')::UUID
      );
    EXCEPTION WHEN OTHERS THEN
      user_id := requesting_user_id();
    END;

    INSERT INTO application_activity_log (
      application_id, action_type, action_details, performed_by, performed_at
    ) VALUES (
      NEW.id,
      'note_added',
      jsonb_build_object(
        'old_notes', OLD.notes,
        'new_notes', NEW.notes,
        'has_notes', NEW.notes IS NOT NULL AND NEW.notes != ''
      ),
      user_id,
      CURRENT_TIMESTAMP
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
