-- ============================================================
-- Identity Sprint — Habit Library Seed Data
-- Run AFTER tracker-schema.sql
-- Created: 2026-02-28
-- ============================================================

-- ============================================================
-- Habit Domains
-- ============================================================
INSERT INTO habit_domains (name, emoji) VALUES
  ('Health & Fitness', '💪'),
  ('Career & Upskilling', '🚀'),
  ('Addiction Recovery', '🌱'),
  ('Mental Wellbeing', '🧠'),
  ('Relationships', '❤️'),
  ('Finance', '💰')
ON CONFLICT DO NOTHING;

-- ============================================================
-- Habits — Health & Fitness (domain_id = 1)
-- ============================================================
WITH d AS (SELECT id FROM habit_domains WHERE name = 'Health & Fitness')
INSERT INTO habits (domain_id, name, description, difficulty, simpler_version) 
SELECT d.id, name, description, difficulty, simpler_version FROM d, (VALUES
  ('Morning walk (20 min)', 'Start your day with a brisk 20-minute outdoor walk', 'easy', '10-min stroll outside'),
  ('Workout (30+ min)', 'Full workout session — gym, home, or sport', 'hard', '15-min bodyweight session'),
  ('Sleep by 10:30pm', 'In bed with lights off by 10:30pm', 'medium', 'In bed by 11pm'),
  ('Drink 2L water', 'Track and hit 2 litres of water throughout the day', 'easy', 'Drink 1L water'),
  ('No junk food', 'Zero ultra-processed foods, takeaway, or sugary snacks', 'hard', 'One healthy meal swap'),
  ('Meditate (10 min)', '10 minutes of focused meditation using any technique or app', 'medium', '5-min breathing exercise'),
  ('Stretching (10 min)', 'Full-body stretching or mobility routine for 10 minutes', 'easy', '5-min morning stretch')
) AS habits(name, description, difficulty, simpler_version)
ON CONFLICT DO NOTHING;

-- ============================================================
-- Habits — Career & Upskilling (domain_id = 2)
-- ============================================================
WITH d AS (SELECT id FROM habit_domains WHERE name = 'Career & Upskilling')
INSERT INTO habits (domain_id, name, description, difficulty, simpler_version)
SELECT d.id, name, description, difficulty, simpler_version FROM d, (VALUES
  ('Deep work block (90 min)', 'Uninterrupted focused work on your most important project', 'hard', '30-min deep work block'),
  ('Read 20 pages', 'Read 20 pages of a non-fiction or skill book', 'medium', 'Read 5 pages'),
  ('Practice skill (30 min)', 'Deliberate practice of a specific skill you are developing', 'medium', '15-min skill practice'),
  ('No social media before noon', 'Keep phone free of social apps until midday', 'medium', 'No social media before 9am'),
  ('Review goals', 'Spend 10 minutes reviewing your weekly and monthly goals', 'easy', '5-min goal review'),
  ('Online course module', 'Complete one module or lesson from an online course', 'medium', 'Watch 10 min of course content')
) AS habits(name, description, difficulty, simpler_version)
ON CONFLICT DO NOTHING;

-- ============================================================
-- Habits — Addiction Recovery (domain_id = 3)
-- ============================================================
WITH d AS (SELECT id FROM habit_domains WHERE name = 'Addiction Recovery')
INSERT INTO habits (domain_id, name, description, difficulty, simpler_version)
SELECT d.id, name, description, difficulty, simpler_version FROM d, (VALUES
  ('Sobriety check-in', 'Affirm your sobriety for today and log how you feel', 'easy', 'Morning affirmation'),
  ('Identify trigger journal', 'Write down any cravings or triggers you experienced and what caused them', 'medium', 'Note one trigger you noticed'),
  ('Replacement habit (walk/call/breathe)', 'When craving hits, use your replacement habit instead', 'medium', 'Use breathing technique once'),
  ('Gratitude log', 'Write 3 specific things you are grateful for today', 'easy', 'Write 1 thing you are grateful for'),
  ('Support group / accountability call', 'Attend or call someone in your support network today', 'hard', 'Send a check-in message to a supporter')
) AS habits(name, description, difficulty, simpler_version)
ON CONFLICT DO NOTHING;

-- ============================================================
-- Habits — Mental Wellbeing (domain_id = 4)
-- ============================================================
WITH d AS (SELECT id FROM habit_domains WHERE name = 'Mental Wellbeing')
INSERT INTO habits (domain_id, name, description, difficulty, simpler_version)
SELECT d.id, name, description, difficulty, simpler_version FROM d, (VALUES
  ('Morning journaling', 'Write freely for 10 minutes first thing in the morning', 'easy', '5-min morning journal'),
  ('Gratitude (3 things)', 'List 3 specific things you are grateful for', 'easy', 'Name 1 good thing from today'),
  ('Evening reflection', 'Spend 10 minutes reflecting on your day — wins, lessons, tomorrow', 'easy', '3-sentence evening reflection'),
  ('Therapy homework', 'Complete the exercise or task set by your therapist or coach', 'hard', 'Review therapy notes for 10 min'),
  ('Limit news to 15 min', 'Consume news for no more than 15 minutes total today', 'medium', 'No news before noon')
) AS habits(name, description, difficulty, simpler_version)
ON CONFLICT DO NOTHING;

-- ============================================================
-- Habits — Relationships (domain_id = 5)
-- ============================================================
WITH d AS (SELECT id FROM habit_domains WHERE name = 'Relationships')
INSERT INTO habits (domain_id, name, description, difficulty, simpler_version)
SELECT d.id, name, description, difficulty, simpler_version FROM d, (VALUES
  ('Meaningful conversation (friend/family)', 'Have one real, present conversation — not just a text exchange', 'easy', 'Send a heartfelt message to someone'),
  ('Acts of service', 'Do something kind or helpful for someone without being asked', 'easy', 'Do one small thing for someone'),
  ('Disconnect from phone at dinner', 'No phone during dinner — be fully present', 'medium', 'No phone for first 15 min of dinner'),
  ('Weekly date/quality time', 'Dedicated quality time with a partner or close friend', 'medium', '30-min undistracted time with someone you care about')
) AS habits(name, description, difficulty, simpler_version)
ON CONFLICT DO NOTHING;

-- ============================================================
-- Habits — Finance (domain_id = 6)
-- ============================================================
WITH d AS (SELECT id FROM habit_domains WHERE name = 'Finance')
INSERT INTO habits (domain_id, name, description, difficulty, simpler_version)
SELECT d.id, name, description, difficulty, simpler_version FROM d, (VALUES
  ('Track all spending', 'Log every expense today in your budget app or notebook', 'easy', 'Track spending over ₹500'),
  ('No impulse purchases', 'Zero unplanned purchases today — pause 24h before buying anything non-essential', 'hard', 'Apply the 10-min pause before any purchase'),
  ('Save target amount', 'Transfer your daily/weekly savings target to your savings account', 'medium', 'Transfer any amount to savings'),
  ('Review budget', 'Spend 15 minutes reviewing your monthly budget vs actuals', 'easy', '5-min budget check')
) AS habits(name, description, difficulty, simpler_version)
ON CONFLICT DO NOTHING;
