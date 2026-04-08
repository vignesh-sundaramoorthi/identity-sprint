-- Migration: Add ai_comparison to outreach_deflection_type enum
-- Phase 3 amendment — Archetype 3 (Disha-crossover) support
-- Approved: Flux H291, Scout H291 (Option B)
-- Context: Distinct from koe_question (community/program context).
--   ai_comparison = prospect used AI coaching (Disha etc.), solved consistency,
--   hitting identity ceiling. Analytically distinct buyer behavior — keep separate
--   for Cohort 2 debrief conversion rate analysis.
-- Safe: No existing data breakage. Extends constraint addend only.
-- Run: Supabase SQL Editor → execute → verify below.

-- Step 1: Drop old constraint
ALTER TABLE applications
  DROP CONSTRAINT IF EXISTS applications_outreach_deflection_type_check;

-- Step 2: Re-add constraint with ai_comparison added
ALTER TABLE applications
  ADD CONSTRAINT applications_outreach_deflection_type_check
  CHECK (outreach_deflection_type IN (
    'what_is_it',
    'how_much',
    'maybe_later',
    'koe_question',
    'ai_comparison',
    'none',
    'no_reply'
  ));

-- Verify: should return 0 rows (no existing data outside new enum)
-- SELECT id, outreach_deflection_type FROM applications
-- WHERE outreach_deflection_type NOT IN ('what_is_it','how_much','maybe_later','koe_question','ai_comparison','none','no_reply')
--   AND outreach_deflection_type IS NOT NULL;

-- Update comment to reflect ai_comparison addition
COMMENT ON COLUMN applications.outreach_deflection_type IS
  'First reply signal from prospect. Predicts conversion probability: '
  'koe_question (25-40% — highest intent, philosophy adopted, needs container) | '
  'ai_comparison (TBD — Archetype 3: used AI coaching, solved consistency, hit identity ceiling) | '
  'what_is_it (20-35% — genuine curiosity, HIGH intent, explain well) | '
  'how_much (15-25% — buying signal, answer structure first, price second) | '
  'none/positive (45-60% — no friction) | '
  'maybe_later (8-15% — avoidance, Day 14-16 re-ping only, never same week) | '
  'no_reply (3-8% — silence, Day 7-10 follow-up, not rejection). '
  'Default: no_reply. Log verbatim what prospect said about AI coaching — Cohort 2 positioning material.';
