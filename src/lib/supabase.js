import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const isSupabaseConfigured = supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project.supabase.co' &&
  supabaseAnonKey !== 'your-anon-key-here' &&
  supabaseUrl.includes('supabase.co')

if (!isSupabaseConfigured) {
  console.warn('⚠️ Supabase is not configured. Leaderboard features will be disabled.')
  console.warn('Please update your .env file with valid Supabase credentials.')
  console.warn('See SUPABASE_SETUP.md for instructions.')
}

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'placeholder-key')

export const isLeaderboardEnabled = isSupabaseConfigured

