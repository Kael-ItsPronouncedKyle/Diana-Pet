import { useState } from 'react'
import { supabase } from '../../lib/supabase.js'

const C = {
  primary: '#6BA89E', primaryLight: '#E8F4F1',
  text: '#3D3535', textLight: '#8A7F7F', card: '#FFFFFF', red: '#E87B7B',
}

export default function AuthModal() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSignIn = async () => {
    if (!email || !password) {
      setError('Email and password are required.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      if (authError) {
        setError(authError.message || 'Sign in failed. Check your email and password.')
      }
    } catch (e) {
      setError('Something went wrong. Try again.')
    }
    setLoading(false)
  }

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      })
      if (authError) {
        setError(authError.message || 'Sign up failed. Try a different email.')
      }
    } catch (e) {
      setError('Something went wrong. Try again.')
    }
    setLoading(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (isSignUp) {
      handleSignUp()
    } else {
      handleSignIn()
    }
  }

  return (
    <div style={{
      minHeight: '100dvh', background: '#FFF8F3',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '20px',
    }}>
      <div style={{
        maxWidth: 430, width: '100%',
        animation: 'fade-up 0.25s ease-out',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🐾</div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: C.text, marginBottom: 8 }}>
            Welcome back
          </h1>
          <p style={{ fontSize: 15, fontWeight: 600, color: C.textLight, lineHeight: 1.5 }}>
            {isSignUp ? 'Create your account' : 'Sign in to keep your check-ins safe.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 700, color: C.text, display: 'block', marginBottom: 6 }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              placeholder="your@email.com"
              style={{
                width: '100%', padding: '12px 14px', borderRadius: 12,
                border: '2px solid #F0E8E0', fontSize: 15, fontWeight: 600,
                background: 'white', color: C.text, outline: 'none',
                boxSizing: 'border-box', opacity: loading ? 0.6 : 1,
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 700, color: C.text, display: 'block', marginBottom: 6 }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              placeholder="••••••"
              style={{
                width: '100%', padding: '12px 14px', borderRadius: 12,
                border: '2px solid #F0E8E0', fontSize: 15, fontWeight: 600,
                background: 'white', color: C.text, outline: 'none',
                boxSizing: 'border-box', opacity: loading ? 0.6 : 1,
              }}
            />
          </div>

          {isSignUp && (
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: C.text, display: 'block', marginBottom: 6 }}>
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                placeholder="••••••"
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: 12,
                  border: '2px solid #F0E8E0', fontSize: 15, fontWeight: 600,
                  background: 'white', color: C.text, outline: 'none',
                  boxSizing: 'border-box', opacity: loading ? 0.6 : 1,
                }}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '14px', borderRadius: 12,
              background: C.primary, color: 'white', border: 'none',
              fontSize: 15, fontWeight: 800, cursor: loading ? 'wait' : 'pointer',
              opacity: loading ? 0.7 : 1, marginTop: 8,
              minHeight: 48,
            }}
          >
            {loading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        {error && (
          <p style={{ marginTop: 16, fontSize: 14, fontWeight: 600, color: C.red, textAlign: 'center' }}>
            {error}
          </p>
        )}

        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: C.textLight }}>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            {' '}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError(null)
                setEmail('')
                setPassword('')
                setConfirmPassword('')
              }}
              style={{
                background: 'none', border: 'none', color: C.primary,
                fontWeight: 800, cursor: 'pointer', fontSize: 13,
                textDecoration: 'underline',
              }}
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>

        <p style={{ marginTop: 24, fontSize: 13, fontWeight: 600, color: C.textLight, lineHeight: 1.5, textAlign: 'center' }}>
          Your data is kept safe and private. Only you can see it.
        </p>
      </div>
    </div>
  )
}
