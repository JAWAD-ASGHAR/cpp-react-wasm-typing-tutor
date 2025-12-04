# Fix Supabase URL Error

## The Problem

You're seeing this error:
```
ERR_NAME_NOT_RESOLVED
cpp-wasm-typing-tutor.supabase.co
```

This means your Supabase URL is incorrect or not configured properly.

## The Solution

### Step 1: Get Your Correct Supabase URL

1. Go to [supabase.com](https://supabase.com) and log in
2. Open your project (or create a new one)
3. Go to **Project Settings** (gear icon) → **API**
4. Copy the **Project URL** - it should look like:
   ```
   https://abcdefghijklmnop.supabase.co
   ```
   (NOT `https://cpp-wasm-typing-tutor.supabase.co`)

5. Copy the **anon/public key** as well

### Step 2: Update Your .env File

Edit the `.env` file in your project root:

```env
VITE_SUPABASE_URL=https://your-actual-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

**Important:** Replace the placeholder values with your actual values from Supabase dashboard.

### Step 3: Restart Your Dev Server

After updating `.env`:

1. Stop your dev server (press `Ctrl+C` in terminal)
2. Start it again:
   ```bash
   npm run dev
   ```

### Step 4: Verify the Table Exists

Make sure you've created the leaderboard table in Supabase:

1. Go to Supabase dashboard → **SQL Editor**
2. Copy and paste the SQL from `supabase-schema.sql`
3. Click **Run**

## Current Status

Your `.env` file currently has:
```
VITE_SUPABASE_URL=https://cpp-wasm-typing-tutor.supabase.co
```

This URL format is incorrect. You need to use the URL from your Supabase project settings, which will look like:
```
https://[random-letters].supabase.co
```

## Quick Fix

1. Open `.env` file
2. Replace the URL with your actual Supabase project URL
3. Replace the anon key with your actual anon key
4. Save the file
5. Restart `npm run dev`

The app will work without the leaderboard if Supabase isn't configured - it's optional!

