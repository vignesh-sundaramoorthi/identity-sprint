-- ============================================================
-- Identity Sprint — Phase 1: Identity Declaration + Check-In Schema
-- Run this in Supabase SQL Editor AFTER tracker-schema.sql
-- Created: 2026-02-28
-- ============================================================

-- Identity declarations: one per challenge
-- "I am becoming the kind of person who..."
CREATE TABLE IF NOT EXISTS identity_declarations (
  id BIGSERIAL PRIMARY KEY,
  challenge_id BIGINT REFERENCES challenges(id) ON DELETE CASCADE,
  identity_goal TEXT NOT NULL,          -- from applications.identity_goal (mirrored here)
  declaration TEXT NOT NULL,            -- "I am becoming..."
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(challenge_id)                  -- one declaration per challenge
);

-- Weekly identity check-ins
CREATE TABLE IF NOT EXISTS identity_checkins (
  id BIGSERIAL PRIMARY KEY,
  challenge_id BIGINT REFERENCES challenges(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,         -- 1-indexed (week 1, 2, 3, 4...)
  identity_rating INTEGER NOT NULL CHECK (identity_rating >= 1 AND identity_rating <= 5),
  reflection TEXT,                      -- freetext reflection
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(challenge_id, week_number)     -- one check-in per week per challenge
);

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE identity_declarations ENABLE ROW LEVEL SECURITY;
ALTER TABLE identity_checkins ENABLE ROW LEVEL SECURITY;

-- Public read/write (protected by challenge_id lookup in app layer)
CREATE POLICY "Public read identity_declarations"
  ON identity_declarations FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public insert identity_declarations"
  ON identity_declarations FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Public update identity_declarations"
  ON identity_declarations FOR UPDATE
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public read identity_checkins"
  ON identity_checkins FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public insert identity_checkins"
  ON identity_checkins FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Public update identity_checkins"
  ON identity_checkins FOR UPDATE
  TO anon, authenticated
  USING (true);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_identity_declarations_challenge ON identity_declarations(challenge_id);
CREATE INDEX IF NOT EXISTS idx_identity_checkins_challenge ON identity_checkins(challenge_id);
CREATE INDEX IF NOT EXISTS idx_identity_checkins_week ON identity_checkins(challenge_id, week_number);
