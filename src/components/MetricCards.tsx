import { useEffect, useState } from 'react'

function useCountUp(target: number, duration = 1200) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let start = 0
    const step = Math.ceil(target / (duration / 16))
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setVal(target); clearInterval(timer) }
      else setVal(start)
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])
  return val
}

function Card({ label, value, sub, gradient, icon, glow, delay = 0 }: {
  label: string; value: number; sub: string; gradient: string; icon: string; glow: string; delay?: number
}) {
  const count = useCountUp(value)
  return (
    <div className="card-hover animate-fade-up" style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}>
      <div style={{ background: gradient, boxShadow: `0 8px 32px ${glow}, 0 0 0 1px rgba(255,255,255,0.05)` }}
        className="rounded-2xl p-4 sm:p-6 relative overflow-hidden h-full">
        {/* Decorative orbs */}
        <div style={{ position: 'absolute', top: -40, right: -40, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ position: 'absolute', bottom: -20, right: 20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', top: '50%', left: -30, width: 100, height: 100, borderRadius: '50%', background: 'rgba(0,0,0,0.1)', transform: 'translateY(-50%)' }} />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4 sm:mb-5">
            <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', borderRadius: 14, width: 44, height: 44 }}
              className="flex items-center justify-center text-xl sm:text-2xl animate-float">{icon}</div>
            <span style={{ background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}
              className="text-white/80 text-xs px-2 sm:px-3 py-1 rounded-full text-right leading-tight max-w-[120px] sm:max-w-none">{sub}</span>
          </div>
          <p className="text-white/60 text-xs font-semibold uppercase tracking-[0.15em] mb-1.5 sm:mb-2">{label}</p>
          <p className="text-5xl sm:text-6xl font-black text-white animate-count-up" style={{ lineHeight: 1, letterSpacing: '-2px' }}>{count}</p>

          {/* Mini shimmer bar */}
          <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 100, height: 3, marginTop: 16, overflow: 'hidden' }}>
            <div style={{ width: '100%', height: '100%', background: 'rgba(255,255,255,0.5)', borderRadius: 100, animation: 'shimmer 2s linear infinite', backgroundSize: '200% auto', backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)' }} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MetricCards({ gitlabCount, linearCount }: { gitlabCount: number; linearCount: number }) {
  const total = gitlabCount + linearCount
  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mb-6">
      <Card label="Total Tickets" value={total} sub={`Updated ${now}`} icon="🎯" delay={0}
        gradient="linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #a855f7 100%)"
        glow="rgba(99,102,241,0.35)" />
      <Card label="GitLab Tickets" value={gitlabCount} sub="Google Sheets" icon="🦊" delay={100}
        gradient="linear-gradient(135deg, #ea580c 0%, #f97316 50%, #fb923c 100%)"
        glow="rgba(249,115,22,0.3)" />
      <Card label="Linear Tickets" value={linearCount} sub="Syeda Malka" icon="⚡" delay={200}
        gradient="linear-gradient(135deg, #1d4ed8 0%, #3b82f6 50%, #06b6d4 100%)"
        glow="rgba(59,130,246,0.3)" />
    </div>
  )
}
