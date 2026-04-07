import { createClient } from '@supabase/supabase-js'

// Read from env vars (set in .env). Falls back to localStorage-only mode when missing.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabaseEnabled = !!(SUPABASE_URL && SUPABASE_ANON_KEY)
export const supabase = supabaseEnabled ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null
