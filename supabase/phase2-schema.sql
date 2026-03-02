-- ============================================================
-- Identity Sprint — Phase 2 Consolidated Schema Migration
-- Run this ONCE in Supabase SQL Editor
-- Supersedes: checkins-schema.sql, outcome-type-schema.sql
-- Created: 2026-03-01
-- ============================================================
-- NOTE: This file is idempotent — safe to run multiple times.
-- All statements use IF NOT EXISTS / IF EXISTS guards.
-- ============================================================


-- ============================================================
-- SECTION 1: checkins table (Feature A3: identity_goal Feedback Loop)
-- ============================================================
CREATE TABLE IF NOT EXISTS checkins (
  id              BIGSERIAL PRIMARY KEY,
  application_id  BIGINT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  week_number     INTEGER NOT NULL CHECK (week_number >= 1),
  identity_rating INTEGER NOT NULL CHECK (identity_rating BETWEEN 1 AND 5),
  reflection_text TEXT,
  -- Field 9: Recognition moment capture (in-sprint)
  -- H1 = "That's exactly it" (Bem self-attribution)
  -- H2 = "I hadn't thought of it that way" (Rosenthal/Pygmalion reframe)
  field_9_recognition TEXT CHECK (field_9_recognition IN ('H1', 'H2', 'both')),
  field_9_verbatim    TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Unique constraint: one check-in per application per week (idempotent)
CREATE UNIQUE INDEX IF NOT EXISTS checkins_application_week_idx
  ON checkins(application_id, week_number);

-- Enable RLS
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;

-- Policies (safe to re-run — IF NOT EXISTS not supported for policies, so wrap in DO block)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'checkins' AND policyname = 'Allow insert for checkins'
  ) THEN
    CREATE POLICY "Allow insert for checkins" ON checkins FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'checkins' AND policyname = 'Allow read for checkins'
  ) THEN
    CREATE POLICY "Allow read for checkins" ON checkins FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'checkins' AND policyname = 'Allow update for checkins'
  ) THEN
    CREATE POLICY "Allow update for checkins" ON checkins FOR UPDATE USING (true);
  END IF;
END $$;


-- ============================================================
-- SECTION 2: Applications table — Phase 1 + Phase 2 columns
-- ============================================================

-- A1: Identity declaration (stores participant's "I am becoming..." statement)
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS identity_declaration TEXT;

-- Outcome Type: A (strong transformation), B (moderate), C (minimal/withdrawn)
-- Set by Vignesh after each Week 4 exit call
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS outcome_type TEXT
  CHECK (outcome_type IN ('A', 'B', 'C'));

-- Stage Signal: Admin badge for application quality
-- Action = green (time-bound language / behavioral specificity)
-- Discovery = amber (generic / short identity_goal)
-- Assess = blue (default)
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS stage_signal TEXT
  CHECK (stage_signal IN ('action', 'discovery', 'assess'));

-- Pre-sprint Signal: Capture during discovery call — which H1/H2 dynamic appeared BEFORE enrollment
-- H1 = "That's exactly it" (confirmed their own frame — Bem self-attribution)
-- H2 = "I hadn't thought of it that way" (received a new frame — Pygmalion effect)
-- none = no clear signal observed during discovery call
-- NULL (default) = discovery call not yet completed
-- @Flux approved H30 | @Sage behavioral science rationale | @Craft copy: "Pre-signal" column
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS pre_sprint_signal TEXT
  CHECK (pre_sprint_signal IN ('H1', 'H2', 'none'));

-- Week 3 badge: "⚠️ Risk" flag for engagement monitoring
-- Set programmatically by admin UI when flat_3_flag triggers
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS week_3_badge TEXT;


-- ============================================================
-- SECTION 3: Field 9 additions to checkins (if table already existed)
-- These are safe no-ops if checkins was just created above with these columns
-- ============================================================
ALTER TABLE checkins
  ADD COLUMN IF NOT EXISTS field_9_recognition TEXT
  CHECK (field_9_recognition IN ('H1', 'H2', 'both'));

ALTER TABLE checkins
  ADD COLUMN IF NOT EXISTS field_9_verbatim TEXT;


-- ============================================================
-- SECTION 4: sprint_participants table (Phase 2 — If-Then Planner)
-- Links applications to cohort enrollment; if-then plans FK here
-- Data model decision: Reynold approved 2026-03-01
-- ============================================================
CREATE TABLE IF NOT EXISTS sprint_participants (
  id              BIGSERIAL PRIMARY KEY,
  application_id  BIGINT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  cohort_id       INTEGER,              -- NULL = pre-cohort system
  enrolled_at     TIMESTAMPTZ DEFAULT NOW(),
  status          TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'withdrawn')),
  UNIQUE(application_id, cohort_id)     -- one enrollment per cohort per applicant
);

CREATE INDEX IF NOT EXISTS idx_sprint_participants_application
  ON sprint_participants(application_id);

CREATE INDEX IF NOT EXISTS idx_sprint_participants_cohort
  ON sprint_participants(cohort_id);

ALTER TABLE sprint_participants ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'sprint_participants' AND policyname = 'Allow read sprint_participants'
  ) THEN
    CREATE POLICY "Allow read sprint_participants" ON sprint_participants FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'sprint_participants' AND policyname = 'Allow insert sprint_participants'
  ) THEN
    CREATE POLICY "Allow insert sprint_participants" ON sprint_participants FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'sprint_participants' AND policyname = 'Allow update sprint_participants'
  ) THEN
    CREATE POLICY "Allow update sprint_participants" ON sprint_participants FOR UPDATE USING (true);
  END IF;
END $$;


-- ============================================================
-- SECTION 5: Week 3 Wall Alert columns on checkins
-- Two-column approach for elapsed-time admin banner (Item 13, Phase 2 PR)
-- @Sage H43 calibration | @Craft H43 banner copy
-- ============================================================

-- wall_triggered_at: SET ONCE on check-in POST when wall condition first becomes true.
--   Condition: week_number = 3 AND identity_rating <= 3 AND max(week1_rating, week2_rating) >= 4
--   Idempotent — only written if currently NULL (preserves original submission timestamp).
--   Used by admin banner to calculate ELAPSED TIME since participant hit the wall.
--   Why not admin-page-load time: participant may submit at 9am, Vignesh opens at 7pm.
--   Science: Pennebaker (1999) disclosure window, Gross & John (2003) regulation timing.
ALTER TABLE checkins
  ADD COLUMN IF NOT EXISTS wall_triggered_at TIMESTAMPTZ;

-- wall_responded_at: SET when Vignesh clicks "Responded" button in admin banner.
--   NULL = banner active. NOT NULL = banner dismissed.
--   Set via PATCH /api/sprint/[id]/checkin/wall-respond (service role).
ALTER TABLE checkins
  ADD COLUMN IF NOT EXISTS wall_responded_at TIMESTAMPTZ;

-- Admin banner states (copy from @Craft H43, verbatim):
--   State 1 (wall_triggered_at < 4h ago, wall_responded_at IS NULL):
--     amber bg — "⚠️ [Name] hit the Week 3 wall — respond within 4 hours."
--   State 2 (wall_triggered_at >= 4h ago, wall_responded_at IS NULL):
--     red bg — "⚠️ [Name] hit the wall [X]h ago — they still need a response."
--   Dismissed (wall_responded_at IS NOT NULL): banner hidden.


-- ============================================================
-- SECTION 6: Indexes for admin performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_applications_stage_signal
  ON applications(stage_signal);

CREATE INDEX IF NOT EXISTS idx_applications_outcome_type
  ON applications(outcome_type);

CREATE INDEX IF NOT EXISTS idx_applications_pre_sprint_signal
  ON applications(pre_sprint_signal);

CREATE INDEX IF NOT EXISTS idx_checkins_field_9
  ON checkins(field_9_recognition);


-- ============================================================
-- SECTION 6: Verification queries
-- Run these after migration to confirm all columns exist
-- ============================================================

-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'applications'
-- ORDER BY ordinal_position;

-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'checkins'
-- ORDER BY ordinal_position;

-- SELECT COUNT(*) FROM sprint_participants;
