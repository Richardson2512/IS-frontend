import { createClient } from '@supabase/supabase-js'

// Use environment variables with fallback to hardcoded values for backward compatibility
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gytwrtduuauffcrvnlza.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5dHdydGR1dWF1ZmZjcnZubHphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1NzUyMDAsImV4cCI6MjA3MjE1MTIwMH0.1YUii8tAfXf7sHvKIE317uawYux6U_Ow74bqCUXkyzw';

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