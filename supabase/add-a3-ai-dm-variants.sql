-- Migration: Add A3-H1-AI and A3-H2-AI to outreach_dm_variant CHECK constraint
-- Forge H288 — 2026-03-22
-- Context: Flux H293 + Craft H294 — Archetype 3 AI-comparison (Disha-crossover) prospects
--   require two sub-variants based on heat signal:
--   A3-H1-AI = identity vocab in LinkedIn About + AI coaching comparison context
--   A3-H2-AI = behavioral vocab in LinkedIn About + AI coaching comparison context
--
-- Safe to run: DROP + re-ADD pattern (same as ai_comparison enum migration).
-- All existing rows have valid enum values — zero data breakage.

-- Step 1: Drop the old CHECK constraint
ALTER TABLE applications
  DROP CONSTRAINT IF EXISTS applications_outreach_dm_variant_check;

-- Step 2: Add new CHECK constraint with 6 valid values
ALTER TABLE applications
  ADD CONSTRAINT applications_outreach_dm_variant_check
  CHECK (outreach_dm_variant IN (
    'A3-H1-A',
    'A3-H1-B',
    'A3-H2-A',
    'A3-H1-AI',
    'A3-H2-AI',
    'warm-contact'
  ));

-- Step 3: Update column comment
COMMENT ON COLUMN applications.outreach_dm_variant IS
  'Which outreach DM variant was sent? Set BEFORE sending DM.
   A3-H1-A    = Standard H1 (fresh interest, first-timer frame)
   A3-H1-B    = Variant B (Day 190+, accumulation-of-failure frame)
   A3-H2-A    = Standard H2 (Suppressed Waiter — behavior vocab in About)
   A3-H1-AI   = Archetype 3, H1 (identity vocab + AI-coaching comparison / Disha-crossover)
   A3-H2-AI   = Archetype 3, H2 (behavior vocab + AI-coaching comparison / Disha-crossover)
   warm-contact = existing network, no A3 protocol (isolates from variant analysis)
   NULL = not yet set
   Critical for Cohort 2 debrief: prevents variant archaeology.
   Added H1-AI/H2-AI in add-a3-ai-dm-variants.sql (Forge H288 2026-03-22).';

-- Verification (run after migration):
-- SELECT constraint_name, check_clause
-- FROM information_schema.check_constraints
-- WHERE constraint_name = 'applications_outreach_dm_variant_check';
