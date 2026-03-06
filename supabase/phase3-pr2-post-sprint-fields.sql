-- Phase 3 PR2: Post-Sprint Fields + Outreach Door + Reply Signal + Exchange Count
-- Run this migration AFTER Phase 3 PR1 (PR #2) is merged and deployed.
-- 13 new columns on the `applications` table (11 original + deflection_logged_at + outreach_dm_variant).

ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS sprint_completion_statement TEXT,
  ADD COLUMN IF NOT EXISTS relational_anchor_type TEXT CHECK (relational_anchor_type IN ('spontaneous', 'coached', 'none')),
  ADD COLUMN IF NOT EXISTS post_sprint_first_checkin_status TEXT CHECK (post_sprint_first_checkin_status IN ('on_time', 'missed', 'pending')),
  ADD COLUMN IF NOT EXISTS post_sprint_language_signal TEXT CHECK (post_sprint_language_signal IN ('graduated', 'threshold', 'unknown')),
  ADD COLUMN IF NOT EXISTS sprint_completion_statement_type TEXT CHECK (sprint_completion_statement_type IN ('categorical', 'process', 'relational', 'null')),
  ADD COLUMN IF NOT EXISTS moment_flag BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS moment_text TEXT,
  ADD COLUMN IF NOT EXISTS outreach_door TEXT CHECK (outreach_door IN ('a', 'b', 'unknown')) DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS outreach_deflection_type TEXT CHECK (outreach_deflection_type IN ('what_is_it', 'how_much', 'maybe_later', 'koe_question', 'none', 'no_reply')) DEFAULT 'no_reply',
  ADD COLUMN IF NOT EXISTS deflection_logged_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reply_length_signal TEXT CHECK (reply_length_signal IN ('brief', 'moderate', 'extended')),
  ADD COLUMN IF NOT EXISTS outreach_exchange_count INTEGER,
  ADD COLUMN IF NOT EXISTS outreach_dm_variant TEXT CHECK (outreach_dm_variant IN ('A3-H1-A', 'A3-H1-B', 'A3-H2-A', 'warm-contact'));

COMMENT ON COLUMN applications.sprint_completion_statement IS 'New Chapter identity artifact — the statement the participant wrote at sprint close.';
COMMENT ON COLUMN applications.relational_anchor_type IS 'Did participant name a relational witness spontaneously, after prompting, or not at all?';
COMMENT ON COLUMN applications.post_sprint_first_checkin_status IS 'Window 3 churn flag — did the participant check in on time post-sprint?';
COMMENT ON COLUMN applications.post_sprint_language_signal IS 'Intervention trigger — did post-sprint language signal graduation, threshold, or unknown?';
COMMENT ON COLUMN applications.sprint_completion_statement_type IS 'Type classifier for sprint_completion_statement.';
COMMENT ON COLUMN applications.moment_flag IS 'Recognition moment flag — was a notable recognition moment observed?';
COMMENT ON COLUMN applications.moment_text IS 'Verbatim or coach note describing the recognition moment.';
COMMENT ON COLUMN applications.outreach_door IS 'Door A = Rescue Frame, Door B = Optimization Frame. Vignesh sets manually from outreach context.';
COMMENT ON COLUMN applications.outreach_deflection_type IS 'First reply signal from prospect. Predicts conversion probability: koe_question (25-40%), what_is_it (20-35%), how_much (15-25%), none/positive (45-60%), maybe_later (8-15%), no_reply (3-8%). Data window opens DM #1.';
COMMENT ON COLUMN applications.deflection_logged_at IS 'Timestamp when outreach_deflection_type was last set in admin. Auto-populated on change. Enables pre/post-application validation: compare vs submitted_at to confirm deflection signal predates application.';
COMMENT ON COLUMN applications.reply_length_signal IS 'Length of prospect first reply. brief = MASTERY signal (one question, match register). moderate = RECOGNITION/CONNECTION mix (professional tone or warm opener). extended = CONNECTION signal (empathy-first, do not rush). Log mid-DM-conversation.';
COMMENT ON COLUMN applications.outreach_exchange_count IS 'Number of DM exchanges before prospect applied. NULL until application received. Tests extended-path completion hypothesis: 3+ exchanges → higher completion rate?';
COMMENT ON COLUMN applications.outreach_dm_variant IS 'Which A3 DM variant was sent? A3-H1-A = Standard H1 (fresh interest, first-timer frame). A3-H1-B = Variant B (Day 190+, accumulation-of-failure frame). A3-H2-A = Standard H2 (Suppressed Waiter). warm-contact = Vignesh existing network, no A3 protocol applied. NULL = not yet set. Set before sending DM. Critical for post-cohort debrief: prevents variant archaeology.';
