import { useState } from 'react'
import MetricCards from './components/MetricCards'
import WeeklySchedule from './components/WeeklySchedule'
import ActivityTable from './components/ActivityTable'
import GitLabLinks from './components/GitLabLinks'
import LinearTickets from './components/LinearTickets'
import GhlTickets from './components/GhlTickets'
import GhlHub from './components/GhlHub'
import GhlReportModal from './components/GhlReportModal'
import StatsBar from './components/StatsBar'
import ToolBreakdown from './components/ToolBreakdown'
import ErrorBoundary from './components/ErrorBoundary'
import SkeletonLoader from './components/SkeletonLoader'
import { useDataLoader } from './hooks/useDataLoader'

function RefreshIcon({ spinning }: { spinning: boolean }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2.5"
      style={{ display: 'block', animation: spinning ? 'spin-slow 0.8s linear infinite' : 'none' }}>
      <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16"/>
    </svg>
  )
}

function Dashboard() {
  const { data, loading, error, refresh, lastUpdated, isLive } = useDataLoader()
  const [reportOpen, setReportOpen] = useState(false)
  const dateStr = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const total = data ? data.gitlab.length + data.linear.length : 0

  return (
    <div className="min-h-screen bg-grid" style={{ background: '#060b18' }}>
      {/* Ambient glows */}
      <div style={{ position: 'fixed', top: '-20%', left: '-10%', width: 600, height: 600, background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', top: '30%', right: '-10%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '0', left: '30%', width: 500, height: 400, background: 'radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      {/* Sticky nav */}
      <header style={{ background: 'rgba(6,11,24,0.85)', borderBottom: '1px solid rgba(99,102,241,0.15)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div className="w-full px-4 sm:px-6 lg:px-10 py-3 flex items-center justify-between gap-2">

          {/* Logo + title */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <div style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', boxShadow: '0 0 20px rgba(99,102,241,0.5)', flexShrink: 0 }}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-white font-black text-xs sm:text-sm">QA</div>
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-bold text-white text-sm truncate">QA Dashboard</span>
              <span style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)', flexShrink: 0 }}
                className="hidden sm:inline text-indigo-400 text-xs px-2 py-0.5 rounded-full">Search Atlas</span>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <div className="hidden md:flex items-center gap-2 text-slate-400 text-xs">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              {dateStr}
            </div>

            {/* GHL Report button */}
            <button onClick={() => setReportOpen(true)} title="View GHL Report"
              style={{
                background: 'rgba(124,58,237,0.12)',
                border: '1px solid rgba(124,58,237,0.25)',
                borderRadius: 8, padding: '6px 12px',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.22)'; e.currentTarget.style.borderColor = 'rgba(124,58,237,0.45)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.12)'; e.currentTarget.style.borderColor = 'rgba(124,58,237,0.25)' }}
            >
              <span style={{ fontSize: 13 }}>🏷️</span>
              <span style={{ color: '#a78bfa', fontSize: 12, fontWeight: 600 }} className="hidden sm:inline">GHL Report</span>
              {data?.ghlTickets?.length ? (
                <span style={{ background: 'rgba(124,58,237,0.25)', color: '#c4b5fd', borderRadius: 100, padding: '1px 7px', fontSize: 10, fontWeight: 700 }}>
                  {data.ghlTickets.length}
                </span>
              ) : null}
            </button>

            {/* Manual refresh button */}
            <button onClick={refresh} disabled={loading} title="Refresh data"
              style={{
                background: 'rgba(99,102,241,0.1)',
                border: '1px solid rgba(99,102,241,0.2)',
                borderRadius: 8, padding: '6px 8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
                transition: 'all 0.15s ease',
              }}>
              <RefreshIcon spinning={loading} />
            </button>

            {/* Online indicator */}
            <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}
              className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-full">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse-glow" style={{ boxShadow: '0 0 8px #4ade80' }} />
              <span className="text-green-300 text-xs font-medium">Syeda Malka</span>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full px-4 sm:px-6 lg:px-10 py-6 sm:py-8" style={{ position: 'relative', zIndex: 1 }}>

        {/* Loading skeleton — only shown on first load (no data yet) */}
        {loading && !data && <SkeletonLoader />}

        {/* Error state */}
        {error && !loading && (
          <div className="flex items-center justify-center py-16 sm:py-24 px-4">
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 16, padding: '28px 24px', maxWidth: 400, width: '100%', textAlign: 'center' }}>
              <div className="text-4xl mb-3">⚠️</div>
              <p className="text-white font-bold mb-2 text-lg">Failed to load data</p>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">{error}</p>
              <button onClick={refresh}
                style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', border: 'none', borderRadius: 10, padding: '10px 28px', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: 14 }}>
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Dashboard content — shown once data is loaded */}
        {data && (
          <>
            {/* Hero */}
            <div className="text-center mb-8 sm:mb-10 animate-fade-up">
              <div className="inline-flex items-center gap-2 mb-3 sm:mb-4"
                style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 100, padding: '6px 16px' }}>
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse-glow" />
                <span className="text-indigo-300 text-xs font-medium">
                  {lastUpdated
                    ? `${isLive ? 'Live' : 'Cached'} · Updated ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                    : 'Connecting to Google Sheets…'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-2 shimmer-text px-4">
                QA Activity Dashboard
              </h1>
              <p className="text-slate-500 text-sm">{dateStr}</p>
            </div>

            {/* Stats bar */}
            <StatsBar total={total} gitlab={data.gitlab.length} linear={data.linear.length} activity={data.activity.length} />

            {/* Metric cards */}
            <MetricCards gitlabCount={data.gitlab.length} linearCount={data.linear.length} />

            {/* GHL Operations Hub */}
            <GhlHub tickets={data.ghlTickets} activities={data.activity} />

            {/* Tool breakdown chart */}
            <ToolBreakdown gitlab={data.gitlab} linear={data.linear} />

            {/* Weekly schedule */}
            <WeeklySchedule />

            {/* Activity + Linear side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <ActivityTable data={data.activity} />
              <LinearTickets tickets={data.linear} />
            </div>

            {/* GHL tickets full width */}
            <GhlTickets tickets={data.ghlTickets} />

            {/* GitLab full width */}
            <GitLabLinks tickets={data.gitlab} />

            <div className="mt-8 sm:mt-10 text-center text-slate-700 text-xs pb-6">
              Data sourced from Google Sheets · Linear API · Built with React + Vite
            </div>
          </>
        )}
      </main>
      {/* GHL Report modal */}
      {reportOpen && data?.ghlTickets && (
        <GhlReportModal tickets={data.ghlTickets} onClose={() => setReportOpen(false)} />
      )}
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <Dashboard />
    </ErrorBoundary>
  )
}
