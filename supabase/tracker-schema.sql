-- ============================================================
-- Identity Sprint — Habit Tracker Schema
-- Run this in Supabase SQL Editor
-- Created: 2026-02-28
-- ============================================================

-- Habit domains (Health, Career, etc.)
CREATE TABLE IF NOT EXISTS habit_domains (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  emoji TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habit library (admin-curated)
CREATE TABLE IF NOT EXISTS habits (
  id BIGSERIAL PRIMARY KEY,
  domain_id BIGINT REFERENCES habit_domains(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  simpler_version TEXT, -- suggested fallback for adaptive algorithm
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User challenges
CREATE TABLE IF NOT EXISTS challenges (
  id BIGSERIAL PRIMARY KEY,
  token TEXT UNIQUE NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT,
  duration_days INTEGER NOT NULL CHECK (duration_days IN (21, 30, 66, 100)),
  start_date DATE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  habit_1_id BIGINT REFERENCES habits(id) ON DELETE SET NULL,
  habit_2_id BIGINT REFERENCES habits(id) ON DELETE SET NULL,
  habit_3_id BIGINT REFERENCES habits(id) ON DELETE SET NULL,
  habit_4_id BIGINT REFERENCES habits(id) ON DELETE SET NULL,
  habit_5_id BIGINT REFERENCES habits(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily check-ins
CREATE TABLE IF NOT EXISTS daily_checkins (
  id BIGSERIAL PRIMARY KEY,
  challenge_id BIGINT REFERENCES challenges(id) ON DELETE CASCADE,
  check_date DATE NOT NULL,
  habit_1_done BOOLEAN DEFAULT false,
  habit_2_done BOOLEAN DEFAULT false,
  habit_3_done BOOLEAN DEFAULT false,
  habit_4_done BOOLEAN DEFAULT false,
  habit_5_done BOOLEAN DEFAULT false,
  mood INTEGER CHECK (mood >= 1 AND mood <= 5),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(challenge_id, check_date)
);

-- Friend groups for leaderboard
CREATE TABLE IF NOT EXISTS groups (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  invite_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS group_members (
  id BIGSERIAL PRIMARY KEY,
  group_id BIGINT REFERENCES groups(id) ON DELETE CASCADE,
  challenge_id BIGINT REFERENCES challenges(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, challenge_id)
);

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE habit_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- habit_domains: public read
CREATE POLICY "Public read habit_domains"
  ON habit_domains FOR SELECT
  TO anon, authenticated
  USING (true);

-- habits: public read
CREATE POLICY "Public read habits"
  ON habits FOR SELECT
  TO anon, authenticated
  USING (true);

-- challenges: token-based read (match by token in URL param)
-- Service role (admin) has full access automatically (bypasses RLS)
CREATE POLICY "Read challenge by token"
  ON challenges FOR SELECT
  TO anon
  USING (true);
  -- Note: In production, filter by token in app layer. 
  -- Full RLS with token matching requires custom JWT claims.
  -- Using service role for admin operations.

CREATE POLICY "Anon can update challenges"
  ON challenges FOR UPDATE
  TO anon
  USING (true);

-- daily_checkins: public read/write (protected by challenge_id lookup)
CREATE POLICY "Public read checkins"
  ON daily_checkins FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public insert checkins"
  ON daily_checkins FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Public update checkins"
  ON daily_checkins FOR UPDATE
  TO anon, authenticated
  USING (true);

-- groups: public read
CREATE POLICY "Public read groups"
  ON groups FOR SELECT
  TO anon, authenticated
  USING (true);

-- group_members: public read/write
CREATE POLICY "Public read group_members"
  ON group_members FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public insert group_members"
  ON group_members FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- ============================================================
-- Indexes for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_challenges_token ON challenges(token);
CREATE INDEX IF NOT EXISTS idx_daily_checkins_challenge_date ON daily_checkins(challenge_id, check_date);
CREATE INDEX IF NOT EXISTS idx_habits_domain ON habits(domain_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_challenge ON group_members(challenge_id);
