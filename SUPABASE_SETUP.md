# Supabase Leaderboard Setup

This guide will help you set up the leaderboard feature using Supabase.

## Prerequisites

1. Create a free Supabase account at [supabase.com](https://supabase.com)
2. Create a new project in Supabase
3. Get your project URL and anon key from Project Settings > API

## Database Setup

### Step 1: Create the Leaderboard Table

Go to your Supabase project dashboard and navigate to **SQL Editor**. Run the following SQL to create the leaderboard table:

```sql
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
```

### Step 2: Configure Environment Variables

1. Copy `.env.example` to `.env` (if you haven't already):
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

   You can find these values in your Supabase project:
   - Go to **Project Settings** > **API**
   - Copy the **Project URL** → `VITE_SUPABASE_URL`
   - Copy the **anon/public key** → `VITE_SUPABASE_ANON_KEY`

3. Restart your development server after updating the `.env` file:
   ```bash
   npm run dev
   ```

## How It Works

1. **After completing a typing test**, users are prompted to enter their name
2. **Scores are submitted** to Supabase with:
   - Username (any string the user provides)
   - WPM (Words Per Minute)
   - Accuracy (percentage)
   - Time (seconds)
3. **Leaderboard shows top 100** users sorted by highest WPM
4. **Best score per user** is displayed (if a user improves, only their best score counts)

## Features

- ✅ No authentication required - just enter a name
- ✅ Automatically tracks best score per user
- ✅ Shows top 100 users
- ✅ Real-time leaderboard updates
- ✅ Secure with Row Level Security (RLS) policies

## Database Schema

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (auto-generated) |
| `username` | TEXT | User's name (any string) |
| `wpm` | INTEGER | Words per minute |
| `accuracy` | DECIMAL(5,2) | Accuracy percentage |
| `time` | DECIMAL(10,2) | Time taken in seconds |
| `created_at` | TIMESTAMP | When the score was submitted |

## Troubleshooting

### Leaderboard not loading
- Check that your `.env` file has the correct Supabase URL and key
- Verify that the table was created successfully in Supabase
- Check browser console for errors

### Can't submit scores
- Verify RLS policies are set up correctly
- Check that the `anon` key has insert permissions
- Make sure the table name is exactly `leaderboard`

### Scores not updating
- The leaderboard shows the highest WPM for each user
- If a user's new score is lower than their previous best, it won't replace it
- Check Supabase logs for any errors

## Optional: Clean Up Old Scores

If you want to clean up old scores (e.g., keep only scores from the last 30 days):

```sql
-- Delete scores older than 30 days (optional)
DELETE FROM leaderboard
WHERE created_at < NOW() - INTERVAL '30 days';
```

Or keep only the best score per user:

```sql
-- Keep only the best score for each user (optional)
DELETE FROM leaderboard
WHERE id NOT IN (
  SELECT DISTINCT ON (username) id
  FROM leaderboard
  ORDER BY username, wpm DESC, created_at DESC
);
```

