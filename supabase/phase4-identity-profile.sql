-- ============================================================
-- Identity Sprint — Phase 4 PR1: Future Identity Profile
-- Adds identity_profile fields to sprint_participants table
-- Run AFTER Phase 3 PR2 (phase3-pr2-post-sprint-fields.sql) is merged and deployed.
-- Created: 2026-03-07
-- ============================================================

ALTER TABLE sprint_participants
  ADD COLUMN IF NOT EXISTS identity_profile JSONB,
  ADD COLUMN IF NOT EXISTS identity_profile_approved BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS identity_profile_approved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS anchor_statement TEXT;

COMMENT ON COLUMN sprint_participants.identity_profile IS 'AI-generated + coach-approved identity profile. JSONB structure: { traits: string[], summary: string, domain: string, signal_tone: "H1"|"H2"|"none" }. NULL = not yet generated. Set by /api/admin/generate-identity-profile.';
COMMENT ON COLUMN sprint_participants.identity_profile_approved IS 'Coach approval flag. FALSE = draft (pending or not started). TRUE = approved and visible to participant dashboard. Set by /api/admin/approve-identity-profile.';
COMMENT ON COLUMN sprint_participants.identity_profile_approved_at IS 'Timestamp when coach approved the identity profile. Used for 24hr abandonment alert: if (NOW() - enrolled_at) > 20hrs AND identity_profile_approved = false, show amber banner in admin.';
COMMENT ON COLUMN sprint_participants.anchor_statement IS 'The "Your anchor" statement — shown Day-1 visible to participant after approval. Extracted from identity_profile JSONB or coach-edited manually. Behavioral science: Gollwitzer implementation intention retrieval + Webb & Sheeran d=0.65.';

-- Verify
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'sprint_participants'
--   AND column_name IN ('identity_profile', 'identity_profile_approved', 'identity_profile_approved_at', 'anchor_statement');
