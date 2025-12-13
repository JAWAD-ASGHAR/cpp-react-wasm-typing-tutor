CREATE TABLE IF NOT EXISTS leaderboard (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL,
  wpm INTEGER NOT NULL,
  accuracy DECIMAL(5, 2) NOT NULL,
  time DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_username ON leaderboard(username);

CREATE INDEX IF NOT EXISTS idx_leaderboard_wpm ON leaderboard(wpm DESC);

ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON leaderboard
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access" ON leaderboard
  FOR INSERT
  WITH CHECK (true);

