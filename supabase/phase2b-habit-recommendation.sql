-- ============================================================
-- Identity Sprint — Phase 2B: habit_recommendation column
-- Add to sprint_participants table
-- Run this in Supabase SQL Editor
-- Created: 2026-03-05
-- ============================================================

ALTER TABLE sprint_participants
  ADD COLUMN IF NOT EXISTS habit_recommendation TEXT;

-- Verify
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'sprint_participants' AND column_name = 'habit_recommendation';
