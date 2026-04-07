import { useState } from 'react'
import { supabase } from '../../lib/supabase.js'

const C = {
  primary: '#6BA89E', primaryLight: '#E8F4F1',
  text: '#3D3535', textLight: '#8A7F7F', card: '#FFFFFF',
}

export default function AuthModal() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const signInWithGoogle = async () => {
    setLoading(true)
    setError(null)
    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      })
      if (authError) setError(authError.message)
    } catch (e) {
      setError('Something went wrong. Try again.')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100dvh', background: '#FFF8F3',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '20px',
    }}>
      <div style={{
        maxWidth: 430, width: '100%', textAlign: 'center',
        animation: 'fade-up 0.25s ease-out',
      }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🐾</div>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: C.text, marginBottom: 8 }}>
          Welcome back
        </h1>
        <p style={{ fontSize: 15, fontWeight: 600, color: C.textLight, marginBottom: 32, lineHeight: 1.5 }}>
          Sign in to keep your check-ins safe.
        </p>

        <button
          onClick={signInWithGoogle}
          disabled={loading}
          style={{
            width: '100%', padding: '16px 20px', borderRadius: 16,
            background: C.card, border: '2px solid #F0E8E0',
            boxShadow: '0 2px 12px rgba(61,53,53,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
            cursor: loading ? 'wait' : 'pointer',
            fontSize: 16, fontWeight: 700, color: C.text,
            opacity: loading ? 0.7 : 1,
            minHeight: 56,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {loading ? 'Signing in...' : 'Sign in with Google'}
        </button>

        {error && (
          <p style={{ marginTop: 16, fontSize: 14, fontWeight: 600, color: '#E87B7B' }}>
            {error}
          </p>
        )}

        <p style={{ marginTop: 24, fontSize: 13, fontWeight: 600, color: C.textLight, lineHeight: 1.5 }}>
          Your data is kept safe and private. Only you can see it.
        </p>
      </div>
    </div>
  )
}
