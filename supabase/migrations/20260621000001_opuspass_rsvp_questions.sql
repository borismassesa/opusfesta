-- OpusPass couple dashboard — custom RSVP questions + guest answers
--
-- Lets couples attach questions to their RSVP flow, Knot-style:
--   • Follow-up questions  (event_id set)  — asked to guests who RSVP to that
--     event; `attending_only = true` mirrors the Knot "asked to guests who
--     RSVP 'Yes'" behaviour.
--   • General questions    (event_id NULL) — asked to everyone who RSVPs,
--     whether or not they can attend.
--
-- Questions are either a short answer (skippable) or multiple choice (required
-- by default — guests must pick an option). Answers are tied to the per-event
-- guest_invitation row so they sit alongside the RSVP that produced them.
--
-- Ownership is denormalized onto every table via user_id (-> users.id) so RLS
-- stays a simple `requesting_user_id() = user_id` check, matching the rest of
-- the couple-dashboard schema. Public RSVP writes are NOT granted via RLS —
-- they go through trusted server actions using the service-role client.

-- 1) Questions the couple configures for their RSVP flow
CREATE TABLE IF NOT EXISTS rsvp_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  -- NULL = a "general" question asked to everyone who RSVPs.
  -- Set   = a "follow-up" question scoped to one event.
  event_id UUID REFERENCES wedding_events(id) ON DELETE CASCADE,

  prompt TEXT NOT NULL,
  description TEXT,
  kind TEXT NOT NULL DEFAULT 'short_answer', -- short_answer | multiple_choice

  -- Multiple-choice answers are required; short answers can be skipped.
  required BOOLEAN NOT NULL DEFAULT false,
  -- Only ask this when the guest is attending (Knot "follow-up" semantics).
  -- General questions ignore this and always show.
  attending_only BOOLEAN NOT NULL DEFAULT false,

  -- For multiple_choice: [{ "id": "opt_xxx", "label": "...", "description": "..." }]
  options JSONB NOT NULL DEFAULT '[]'::jsonb,

  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2) A guest's answer to one question, tied to the RSVP it came from
CREATE TABLE IF NOT EXISTS rsvp_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  guest_invitation_id UUID NOT NULL REFERENCES guest_invitations(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES rsvp_questions(id) ON DELETE CASCADE,

  -- short_answer: free text. multiple_choice: the chosen option's label.
  answer_text TEXT,
  -- multiple_choice: the chosen option's id (from rsvp_questions.options).
  option_id TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- One answer per question per RSVP; re-submitting upserts.
  UNIQUE (guest_invitation_id, question_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_rsvp_questions_user_id ON rsvp_questions(user_id);
CREATE INDEX IF NOT EXISTS idx_rsvp_questions_event ON rsvp_questions(event_id);
CREATE INDEX IF NOT EXISTS idx_rsvp_answers_user_id ON rsvp_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_rsvp_answers_invitation ON rsvp_answers(guest_invitation_id);
CREATE INDEX IF NOT EXISTS idx_rsvp_answers_question ON rsvp_answers(question_id);

-- updated_at triggers (reuse the shared trigger fn from the dashboard migration)
DROP TRIGGER IF EXISTS trg_rsvp_questions_updated_at ON rsvp_questions;
CREATE TRIGGER trg_rsvp_questions_updated_at
  BEFORE UPDATE ON rsvp_questions FOR EACH ROW
  EXECUTE FUNCTION set_updated_at_timestamp();

DROP TRIGGER IF EXISTS trg_rsvp_answers_updated_at ON rsvp_answers;
CREATE TRIGGER trg_rsvp_answers_updated_at
  BEFORE UPDATE ON rsvp_answers FOR EACH ROW
  EXECUTE FUNCTION set_updated_at_timestamp();

-- RLS: owner-only. Public RSVP reads/writes go through the service role.
ALTER TABLE rsvp_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsvp_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY rsvp_questions_owner ON rsvp_questions
  FOR ALL USING (requesting_user_id() = user_id)
  WITH CHECK (requesting_user_id() = user_id);

CREATE POLICY rsvp_answers_owner ON rsvp_answers
  FOR ALL USING (requesting_user_id() = user_id)
  WITH CHECK (requesting_user_id() = user_id);
