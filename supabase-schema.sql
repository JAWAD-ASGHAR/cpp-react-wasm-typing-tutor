-- Supabase Leaderboard Table Schema
-- Run this in your Supabase SQL Editor

-- Create leaderboard table
CREATE TABLE IF NOT EXISTS leaderboard (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL,
  wpm INTEGER NOT NULL,
  accuracy DECIMAL(5, 2) NOT NULL,
  time DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_leaderboard_username ON leaderboard(username);

-- Create index on wpm for faster sorting
CREATE INDEX IF NOT EXISTS idx_leaderboard_wpm ON leaderboard(wpm DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read (view leaderboard)
CREATE POLICY "Allow public read access" ON leaderboard
  FOR SELECT
  USING (true);

-- Create policy to allow anyone to insert (submit scores)
CREATE POLICY "Allow public insert access" ON leaderboard
  FOR INSERT
  WITH CHECK (true);

