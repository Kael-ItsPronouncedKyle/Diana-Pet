import { createClient } from '@supabase/supabase-js'

// The anon key is a public key — safe to hardcode in client-side code.
// It is NOT a secret. Supabase Row Level Security (RLS) controls access.
const SUPABASE_URL = 'https://szhelpjzqvpcqneiqwyq.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6aGVscGp6cXZwY3FuZWlxd3lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MjIzMjgsImV4cCI6MjA5MTA5ODMyOH0._5tzQtfUouWqAUx55qfQfD3si49BJleWYJL2ShbfoHU'

export const supabaseEnabled = true
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
