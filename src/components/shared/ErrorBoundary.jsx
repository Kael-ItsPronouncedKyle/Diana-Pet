import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info?.componentStack)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100dvh',
          background: '#FFF8F3',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 32,
          fontFamily: "'Nunito', sans-serif",
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>💚</div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#3D3535', marginBottom: 8 }}>
            Something went wrong.
          </h1>
          <p style={{ fontSize: 15, color: '#8A7F7F', fontWeight: 600, marginBottom: 24, lineHeight: 1.5 }}>
            Your data is safe. Try refreshing.
          </p>
          <button
            onClick={this.handleReset}
            style={{
              padding: '14px 28px',
              borderRadius: 16,
              border: 'none',
              background: '#6BA89E',
              color: 'white',
              fontSize: 16,
              fontWeight: 800,
              cursor: 'pointer',
              marginBottom: 12,
              minHeight: 48,
            }}
          >
            Try again
          </button>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              borderRadius: 14,
              border: '2px solid #F0E8E0',
              background: 'white',
              color: '#3D3535',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              minHeight: 44,
            }}
          >
            Reload app
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
