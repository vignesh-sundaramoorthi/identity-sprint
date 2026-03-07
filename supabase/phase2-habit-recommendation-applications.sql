-- ============================================================
-- Identity Sprint — Phase 2: habit_recommendation on applications
-- Adds the gateway habit selected during the discovery call
-- Run this in Supabase SQL Editor
-- Created: 2026-03-07
-- ============================================================

-- Add habit_recommendation to applications table
-- (sprint_participants.habit_recommendation was added in phase2b-habit-recommendation.sql)
-- This column is set by Vignesh via the Discovery Call Guide admin panel
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS habit_recommendation TEXT;

-- Verify
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'applications' AND column_name = 'habit_recommendation';
