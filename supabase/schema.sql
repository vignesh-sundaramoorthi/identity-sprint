-- Identity Sprint: Applications table
-- Run this once in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS applications (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT,
  identity_goal TEXT NOT NULL,
  tried_before TEXT NOT NULL,
  why_now TEXT NOT NULL,
  commitment TEXT NOT NULL,
  status TEXT DEFAULT 'new',
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Allow anyone to submit an application
CREATE POLICY "Allow insert from anyone" ON applications
  FOR INSERT WITH CHECK (true);

-- Allow reading all applications (admin uses service role key which bypasses RLS)
CREATE POLICY "Allow read for all" ON applications
  FOR SELECT USING (true);
