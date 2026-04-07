import { supabase, supabaseEnabled } from '../lib/supabase.js'

// Resolve which Supabase table and key fields to use for a given storage key
function resolveTable(key) {
  if (key === 'diana-profile') {
    return { table: 'profiles', keyField: null, keyValue: null }
  }
  if (key.startsWith('diana-daily:')) {
    const date = key.replace('diana-daily:', '')
    return { table: 'daily_entries', keyField: 'date', keyValue: date }
  }
  // Everything else (dbt-history, words-seen, weekly screenings)
  return { table: 'app_data', keyField: 'key', keyValue: key }
}

// Get the current user ID from Supabase auth
function getUserId() {
  if (!supabase) return null
  const session = supabase.auth.session?.()
  // supabase-js v2 uses getSession
  return null // Will be set via setUserId after auth
}

let _userId = null

const storage = {
  // Set the authenticated user ID (called after auth)
  setUserId(id) {
    _userId = id
  },

  async get(key) {
    // Always try localStorage first for speed
    try {
      const val = localStorage.getItem(key)
      if (val !== null) return JSON.parse(val)
    } catch {
      // fall through to Supabase
    }

    // Fall back to Supabase if available
    if (supabaseEnabled && supabase && _userId) {
      try {
        const { table, keyField, keyValue } = resolveTable(key)
        let query = supabase.from(table).select('data').eq('user_id', _userId)
        if (keyField) query = query.eq(keyField, keyValue)
        const { data, error } = await query.maybeSingle()
        if (!error && data) {
          // Cache in localStorage
          localStorage.setItem(key, JSON.stringify(data.data))
          return data.data
        }
      } catch {
        // Supabase unavailable, localStorage-only mode
      }
    }

    return null
  },

  async set(key, val) {
    // Always write to localStorage immediately
    try {
      localStorage.setItem(key, JSON.stringify(val))
    } catch {
      return false
    }

    // Async sync to Supabase (non-blocking)
    if (supabaseEnabled && supabase && _userId) {
      try {
        const { table, keyField, keyValue } = resolveTable(key)
        const row = { user_id: _userId, data: val }
        if (keyField) row[keyField] = keyValue

        // Upsert: insert or update on conflict
        const conflictFields = keyField ? `user_id,${keyField}` : 'user_id'
        await supabase.from(table).upsert(row, { onConflict: conflictFields })
      } catch {
        // Supabase sync failed — data is still in localStorage
      }
    }

    return true
  },

  async delete(key) {
    try {
      localStorage.removeItem(key)
    } catch {
      return false
    }

    if (supabaseEnabled && supabase && _userId) {
      try {
        const { table, keyField, keyValue } = resolveTable(key)
        let query = supabase.from(table).delete().eq('user_id', _userId)
        if (keyField) query = query.eq(keyField, keyValue)
        await query
      } catch {
        // Supabase delete failed — localStorage already cleared
      }
    }

    return true
  },

  async list(prefix) {
    const localKeys = []
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (k && k.startsWith(prefix)) localKeys.push(k)
      }
    } catch {
      // ignore
    }

    // Merge with Supabase keys if available
    if (supabaseEnabled && supabase && _userId) {
      try {
        if (prefix.startsWith('diana-daily:') || prefix === 'diana-daily:') {
          const { data } = await supabase
            .from('daily_entries')
            .select('date')
            .eq('user_id', _userId)
          if (data) {
            const remoteKeys = data.map(d => `diana-daily:${d.date}`)
            const merged = new Set([...localKeys, ...remoteKeys])
            return [...merged]
          }
        }
      } catch {
        // Fall back to localStorage keys only
      }
    }

    return localKeys
  },

  // Pull all data from Supabase and merge into localStorage
  // Supabase wins if data exists (cloud is source of truth)
  async sync() {
    if (!supabaseEnabled || !supabase || !_userId) return

    try {
      // Sync profile
      const { data: profileRow } = await supabase
        .from('profiles')
        .select('data')
        .eq('user_id', _userId)
        .maybeSingle()
      if (profileRow?.data) {
        localStorage.setItem('diana-profile', JSON.stringify(profileRow.data))
      }

      // Sync daily entries
      const { data: dailyRows } = await supabase
        .from('daily_entries')
        .select('date, data')
        .eq('user_id', _userId)
      if (dailyRows) {
        for (const row of dailyRows) {
          localStorage.setItem(`diana-daily:${row.date}`, JSON.stringify(row.data))
        }
      }

      // Sync app data
      const { data: appRows } = await supabase
        .from('app_data')
        .select('key, data')
        .eq('user_id', _userId)
      if (appRows) {
        for (const row of appRows) {
          localStorage.setItem(row.key, JSON.stringify(row.data))
        }
      }
    } catch {
      // Sync failed — continue with localStorage data
    }
  },
}

export default storage
