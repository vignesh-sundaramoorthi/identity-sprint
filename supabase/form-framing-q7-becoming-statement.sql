-- Migration: Form Framing — Q7 "I'm becoming someone who..."
-- Branch: form-framing-q2-q6-q7
-- Date: 2026-03-08
--
-- Adds becoming_statement to the discovery table (quiz answers live here).
-- Q7 is optional — NULLABLE. No default, no constraint.
-- Admin: surfaced in /admin alongside identity_goal and q6_failure.
--
-- Run in Supabase SQL Editor:

ALTER TABLE discovery
  ADD COLUMN IF NOT EXISTS becoming_statement TEXT;

-- Verify:
-- SELECT id, email, becoming_statement FROM discovery LIMIT 5;
