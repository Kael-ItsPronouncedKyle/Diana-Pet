import { supabase, supabaseEnabled } from '../lib/supabase.js'

// --- Encryption layer (AES-GCM via Web Crypto API) ---

const APP_SALT = 'diana-companion-app-v1-salt'
const ENCRYPTION_KEY_STORAGE = 'diana-encryption-key'
const ENCRYPTED_PREFIX = 'enc:' // Prefix to identify encrypted values

// Keys that contain sensitive recovery/behavioral data and should be encrypted
function isSensitiveKey(key) {
  return key.startsWith('diana-daily:') || key === 'diana-profile'
}

// Get or create the random base key (stored as hex in localStorage)
function getOrCreateBaseKey() {
  let stored = null
  try {
    stored = localStorage.getItem(ENCRYPTION_KEY_STORAGE)
  } catch { /* ignore */ }

  if (stored) return stored

  // Generate 32 random bytes, store as hex
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
  try {
    localStorage.setItem(ENCRYPTION_KEY_STORAGE, hex)
  } catch { /* ignore */ }
  return hex
}

// Derive an AES-GCM CryptoKey from the stored base key + app salt
let _derivedKey = null
async function getDerivedKey() {
  if (_derivedKey) return _derivedKey

  const baseKeyHex = getOrCreateBaseKey()
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(baseKeyHex + APP_SALT),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  )

  _derivedKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode(APP_SALT),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )

  return _derivedKey
}

// Encrypt a string, return base64-encoded blob (iv + ciphertext)
async function encryptString(plaintext) {
  const key = await getDerivedKey()
  const encoder = new TextEncoder()
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(plaintext)
  )
  // Combine iv + ciphertext into one array
  const combined = new Uint8Array(iv.length + ciphertext.byteLength)
  combined.set(iv, 0)
  combined.set(new Uint8Array(ciphertext), iv.length)
  // Base64 encode
  let binary = ''
  for (let i = 0; i < combined.length; i++) {
    binary += String.fromCharCode(combined[i])
  }
  return ENCRYPTED_PREFIX + btoa(binary)
}

// Decrypt a base64-encoded blob back to string
async function decryptString(encoded) {
  if (!encoded.startsWith(ENCRYPTED_PREFIX)) return encoded

  const key = await getDerivedKey()
  const base64 = encoded.slice(ENCRYPTED_PREFIX.length)
  const binary = atob(base64)
  const combined = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    combined[i] = binary.charCodeAt(i)
  }
  const iv = combined.slice(0, 12)
  const ciphertext = combined.slice(12)
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  )
  return new TextDecoder().decode(decrypted)
}

// --- End encryption layer ---

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

let _userId = null

const storage = {
  // Set the authenticated user ID (called after auth)
  setUserId(id) {
    _userId = id
  },

  async get(key) {
    // Always try localStorage first for speed
    try {
      const raw = localStorage.getItem(key)
      if (raw !== null) {
        if (isSensitiveKey(key) && raw.startsWith(ENCRYPTED_PREFIX)) {
          // Encrypted data — decrypt then parse
          const decrypted = await decryptString(raw)
          return JSON.parse(decrypted)
        }
        // Unencrypted data (legacy or non-sensitive) — parse directly
        return JSON.parse(raw)
      }
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
          // Cache in localStorage (encrypted if sensitive)
          if (isSensitiveKey(key)) {
            const encrypted = await encryptString(JSON.stringify(data.data))
            localStorage.setItem(key, encrypted)
          } else {
            localStorage.setItem(key, JSON.stringify(data.data))
          }
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
      if (isSensitiveKey(key)) {
        const encrypted = await encryptString(JSON.stringify(val))
        localStorage.setItem(key, encrypted)
      } else {
        localStorage.setItem(key, JSON.stringify(val))
      }
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
        const encrypted = await encryptString(JSON.stringify(profileRow.data))
        localStorage.setItem('diana-profile', encrypted)
      }

      // Sync daily entries
      const { data: dailyRows } = await supabase
        .from('daily_entries')
        .select('date, data')
        .eq('user_id', _userId)
      if (dailyRows) {
        for (const row of dailyRows) {
          const encrypted = await encryptString(JSON.stringify(row.data))
          localStorage.setItem(`diana-daily:${row.date}`, encrypted)
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
