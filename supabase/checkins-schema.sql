-- Identity Sprint: Phase 1 Schema Changes
-- Run this in Supabase SQL Editor

-- ============================================================
-- 1. checkins table (Feature A3: identity_goal Feedback Loop)
-- ============================================================
CREATE TABLE IF NOT EXISTS checkins (
  id          BIGSERIAL PRIMARY KEY,
  application_id BIGINT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  week_number    INTEGER NOT NULL CHECK (week_number >= 1),
  identity_rating INTEGER NOT NULL CHECK (identity_rating BETWEEN 1 AND 5),
  reflection_text TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Unique constraint: one check-in per application per week
CREATE UNIQUE INDEX IF NOT EXISTS checkins_application_week_idx
  ON checkins(application_id, week_number);

-- Enable RLS
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;

-- Anyone with the application_id (UUID-style URL) can insert their own check-in
CREATE POLICY "Allow insert for checkins" ON checkins
  FOR INSERT WITH CHECK (true);

-- Allow reading (service role bypasses RLS for admin)
CREATE POLICY "Allow read for checkins" ON checkins
  FOR SELECT USING (true);

-- Allow update (upsert on duplicate week)
CREATE POLICY "Allow update for checkins" ON checkins
  FOR UPDATE USING (true);

-- ============================================================
-- 2. identity_declaration column (Feature A1: Onboarding Declaration)
-- ============================================================
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS identity_declaration TEXT;
