import { Component, type ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { hasError: boolean; error: Error | null }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#060b18' }}>
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 16, padding: '32px 24px', maxWidth: 480, width: '100%', textAlign: 'center' }}>
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-white text-xl font-bold mb-2">Something went wrong</h2>
            <p className="text-slate-400 text-sm mb-6 break-words">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', border: 'none', borderRadius: 10, padding: '10px 24px', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: 14 }}>
              Reload Page
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
