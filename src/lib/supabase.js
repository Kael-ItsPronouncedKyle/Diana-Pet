import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Force local-only mode for now (Supabase will be set up later)
// Set to true to enable Supabase: export const supabaseEnabled = !!(supabaseUrl && supabaseAnonKey)
export const supabaseEnabled = false

export const supabase = supabaseEnabled && supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null
