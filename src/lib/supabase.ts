import { createClient } from '@supabase/supabase-js'

// Require environment variables - no hardcoded fallbacks for security
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing required Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface User {
  id: string
  email: string
  name: string
  created_at: string
  subscription_tier: 'free' | 'standard' | 'pro'
  search_count: number
  last_reset_date: string
}

export interface SearchHistory {
  id: string
  user_id: string
  query: string
  language: string
  time_filter: string
  platforms: string[]
  results_count: number
  created_at: string
}