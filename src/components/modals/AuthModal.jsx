import { useState } from 'react'
import { supabase } from '../../lib/supabase.js'

const C = {
  primary: '#6BA89E', primaryLight: '#E8F4F1',
  text: '#3D3535', textLight: '#8A7F7F', card: '#FFFFFF', red: '#E87B7B',
}

// Map Supabase error messages to simple, warm language
function friendlyError(msg) {
  if (!msg) return 'Something went wrong. Try again.'
  const lower = msg.toLowerCase()
  if (lower.includes('invalid login credentials') || lower.includes('invalid email or password'))
    return 'That email or password didn\u2019t work. Try again?'
  if (lower.includes('email not confirmed'))
    return 'Check your email first \u2014 there\u2019s a link to click before you can sign in.'
  if (lower.includes('user already registered') || lower.includes('already been registered'))
    return 'That email already has an account. Try signing in instead.'
  if (lower.includes('rate limit') || lower.includes('too many requests'))
    return 'Too many tries. Wait a minute and try again.'
  if (lower.includes('network') || lower.includes('fetch'))
    return 'Can\u2019t reach the server. Check your internet and try again.'
  if (lower.includes('weak password') || lower.includes('password'))
    return 'That password is too short. Use at least 6 letters.'
  return msg
}

export default function AuthModal() {
  const [mode, setMode] = useState('signin') // 'signin' | 'signup' | 'forgot'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [signUpSuccess, setSignUpSuccess] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  const handleSignIn = async () => {
    if (!email || !password) {
      setError('Please type your email and password.')
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
        setError(friendlyError(authError.message))
      }
    } catch (e) {
      setError('Something went wrong. Try again.')
    }
    setLoading(false)
  }

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all the boxes.')
      return
    }
    if (password !== confirmPassword) {
      setError('The passwords don\u2019t match. Try typing them again.')
      return
    }
    if (password.length < 6) {
      setError('Password needs at least 6 letters or numbers.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      })
      if (authError) {
        setError(friendlyError(authError.message))
      } else if (data?.user && !data.session) {
        // Email confirmation required — tell the user
        setSignUpSuccess(true)
      }
      // If data.session exists, onAuthStateChange handles the rest
    } catch (e) {
      setError('Something went wrong. Try again.')
    }
    setLoading(false)
  }

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Type your email first, then tap this button.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim()
      )
      if (resetError) {
        setError(friendlyError(resetError.message))
      } else {
        setResetSent(true)
      }
    } catch (e) {
      setError('Something went wrong. Try again.')
    }
    setLoading(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (mode === 'signup') {
      handleSignUp()
    } else {
      handleSignIn()
    }
  }

  const switchMode = (newMode) => {
    setMode(newMode)
    setError(null)
    setSignUpSuccess(false)
    setResetSent(false)
    setPassword('')
    setConfirmPassword('')
  }

  // Forgot password screen
  if (mode === 'forgot') {
    return (
      <div style={{
        minHeight: '100dvh', background: '#FFF8F3',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: '20px',
      }}>
        <div style={{ maxWidth: 430, width: '100%', animation: 'fade-up 0.25s ease-out' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🔑</div>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: C.text, marginBottom: 8 }}>
              Reset password
            </h1>
            <p style={{ fontSize: 15, fontWeight: 600, color: C.textLight, lineHeight: 1.5 }}>
              Type your email and we'll send you a link to pick a new password.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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

            <button
              onClick={handleForgotPassword}
              disabled={loading}
              style={{
                width: '100%', padding: '14px', borderRadius: 12,
                background: C.primary, color: 'white', border: 'none',
                fontSize: 15, fontWeight: 800, cursor: loading ? 'wait' : 'pointer',
                opacity: loading ? 0.7 : 1, marginTop: 8, minHeight: 48,
              }}
            >
              {loading ? 'Sending...' : 'Send reset link'}
            </button>
          </div>

          {error && (
            <p style={{ marginTop: 16, fontSize: 14, fontWeight: 600, color: C.red, textAlign: 'center' }}>
              {error}
            </p>
          )}

          {resetSent && (
            <div style={{ marginTop: 16, padding: '16px', borderRadius: 14, background: '#E6F7EC', border: '2px solid #6BBF8A', textAlign: 'center' }}>
              <p style={{ fontSize: 15, fontWeight: 800, color: '#3D3535', marginBottom: 4 }}>
                Check your email!
              </p>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#8A7F7F', lineHeight: 1.5 }}>
                We sent a link to reset your password. After you pick a new one, come back and sign in.
              </p>
            </div>
          )}

          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <button
              onClick={() => switchMode('signin')}
              style={{
                background: 'none', border: 'none', color: C.primary,
                fontWeight: 800, cursor: 'pointer', fontSize: 13,
                textDecoration: 'underline',
              }}
            >
              Back to sign in
            </button>
          </div>
        </div>
      </div>
    )
  }

  const isSignUp = mode === 'signup'

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
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </h1>
          <p style={{ fontSize: 15, fontWeight: 600, color: C.textLight, lineHeight: 1.5 }}>
            {isSignUp ? 'Set up your account to keep your data safe.' : 'Sign in to see your check-ins.'}
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

        {!isSignUp && (
          <div style={{ marginTop: 12, textAlign: 'center' }}>
            <button
              onClick={() => switchMode('forgot')}
              style={{
                background: 'none', border: 'none', color: C.textLight,
                fontWeight: 700, cursor: 'pointer', fontSize: 13,
              }}
            >
              Forgot your password?
            </button>
          </div>
        )}

        {error && (
          <p style={{ marginTop: 16, fontSize: 14, fontWeight: 600, color: C.red, textAlign: 'center', lineHeight: 1.5 }}>
            {error}
          </p>
        )}

        {signUpSuccess && (
          <div style={{ marginTop: 16, padding: '16px', borderRadius: 14, background: '#E6F7EC', border: '2px solid #6BBF8A', textAlign: 'center' }}>
            <p style={{ fontSize: 15, fontWeight: 800, color: '#3D3535', marginBottom: 4 }}>
              Account created!
            </p>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#8A7F7F', lineHeight: 1.5 }}>
              Check your email for a link to click. Then come back here and sign in.
            </p>
          </div>
        )}

        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: C.textLight }}>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            {' '}
            <button
              onClick={() => switchMode(isSignUp ? 'signin' : 'signup')}
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
