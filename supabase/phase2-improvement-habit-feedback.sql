-- Phase 2 Improvement — Discovery Call Guide personalisation
-- Adds coach feedback columns for habit recommendation quality tracking
--
-- Run ONCE after deploying the phase2-improvement-discovery-guide branch.
-- Safe to run multiple times (IF NOT EXISTS).
--
-- habit_recommendation_feedback: did the auto-recommendation help?
-- habit_recommendation_custom:   what did coach use instead (if 'custom')

ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS habit_recommendation_feedback TEXT
    CHECK (habit_recommendation_feedback IN ('helpful', 'not_helpful', 'custom'));

ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS habit_recommendation_custom TEXT;

-- habit_recommendation_chosen: the actual habit assigned (learning signal)
-- Captures which habit coach prescribed regardless of feedback rating.
-- Populated on every Assign click — not just when feedback = 'custom'.
-- Enables: "which system Rank was override most common?" at Cohort 1 debrief.
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS habit_recommendation_chosen TEXT;

-- Verify
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'applications'
  AND column_name IN (
    'habit_recommendation',
    'habit_recommendation_feedback',
    'habit_recommendation_custom',
    'habit_recommendation_chosen'
  )
ORDER BY column_name;
