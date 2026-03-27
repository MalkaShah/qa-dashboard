const SCHEDULE: Record<string, string[]> = {
  Monday:    ['Dashboard', 'OTTO SEO', 'Site Audit'],
  Tuesday:   ['Site Metrics', 'Local SEO/GBP'],
  Wednesday: ['Content Genius', 'Keyword Ranker'],
  Thursday:  ['GSC Performance', 'Authority Builder'],
  Friday:    ['Smart Ads/OTTO PPC', 'Report Builder'],
}

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

const DAY_COLORS = [
  { bg: 'rgba(99,102,241,0.1)',  border: 'rgba(99,102,241,0.3)',  pill: 'rgba(99,102,241,0.2)',  text: '#a5b4fc' },
  { bg: 'rgba(168,85,247,0.1)', border: 'rgba(168,85,247,0.3)', pill: 'rgba(168,85,247,0.2)', text: '#d8b4fe' },
  { bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.3)', pill: 'rgba(59,130,246,0.2)', text: '#93c5fd' },
  { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', pill: 'rgba(16,185,129,0.2)', text: '#6ee7b7' },
  { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', pill: 'rgba(245,158,11,0.2)', text: '#fcd34d' },
]

function getWeekDays() {
  const today = new Date()
  const dow = today.getDay()
  const diff = dow === 0 ? -6 : 1 - dow
  const monday = new Date(today)
  monday.setDate(today.getDate() + diff)
  return DAY_NAMES.map((name, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return {
      name,
      date: d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' }),
      isToday: d.toDateString() === today.toDateString(),
      isPast: d < today && d.toDateString() !== today.toDateString(),
    }
  })
}

export default function WeeklySchedule() {
  const days = getWeekDays()
  const today = days.find(d => d.isToday)

  return (
    <div style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(99,102,241,0.15)', backdropFilter: 'blur(8px)' }}
      className="rounded-2xl p-4 sm:p-6 mb-6">

      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white">Weekly QA Schedule</h2>
          <p className="text-slate-400 text-xs mt-0.5">Auto-updates every Monday</p>
        </div>
        {today && (
          <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.2))', border: '1px solid rgba(99,102,241,0.4)' }}
            className="rounded-xl px-3 sm:px-4 py-2 text-center flex-shrink-0">
            <p className="text-indigo-300 text-xs font-medium">TODAY</p>
            <p className="text-white text-sm font-bold">{today.name}</p>
          </div>
        )}
      </div>

      {/* Today's callout */}
      {today && (
        <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.1))', border: '1px solid rgba(99,102,241,0.25)' }}
          className="rounded-xl p-3 sm:p-4 mb-4 sm:mb-5 flex items-center gap-3 sm:gap-4">
          <div style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', boxShadow: '0 0 20px rgba(99,102,241,0.4)', flexShrink: 0 }}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-base sm:text-lg">🎯</div>
          <div>
            <p className="text-indigo-300 text-xs font-medium mb-1">TODAY'S TESTING TOOLS</p>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {SCHEDULE[today.name]?.map(tool => (
                <span key={tool} style={{ background: 'rgba(99,102,241,0.25)', border: '1px solid rgba(99,102,241,0.4)' }}
                  className="text-indigo-100 text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 rounded-lg">{tool}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5-day grid — horizontally scrollable on small screens */}
      <div className="relative">
        {/* Right fade hint on mobile */}
        <div className="absolute right-0 top-0 bottom-0 w-8 pointer-events-none sm:hidden z-10"
          style={{ background: 'linear-gradient(to left, rgba(30,41,59,0.9), transparent)' }} />

        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0 pb-1">
          <div style={{ minWidth: 580 }} className="grid grid-cols-5 gap-2 sm:gap-3">
            {days.map(({ name, date, isToday, isPast }, idx) => {
              const c = DAY_COLORS[idx]
              return (
                <div key={name} style={{
                  background: isToday ? 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(168,85,247,0.15))' : c.bg,
                  border: `1px solid ${isToday ? 'rgba(99,102,241,0.6)' : c.border}`,
                  boxShadow: isToday ? '0 0 20px rgba(99,102,241,0.2), inset 0 1px 0 rgba(255,255,255,0.05)' : 'none',
                  opacity: isPast ? 0.6 : 1,
                }} className="rounded-xl p-2.5 sm:p-3 transition-all">
                  <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                    <p className="text-xs font-bold uppercase tracking-wider" style={{ color: isToday ? '#a5b4fc' : c.text }}>
                      {name.slice(0, 3)}
                    </p>
                    {isToday && <span style={{ background: 'rgba(99,102,241,0.4)' }} className="text-indigo-200 text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 rounded-full font-bold">NOW</span>}
                    {isPast && <span className="text-slate-600 text-[10px]">✓</span>}
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-white mb-2 sm:mb-3">{date}</p>
                  <div className="space-y-1 sm:space-y-1.5">
                    {SCHEDULE[name].map(tool => (
                      <div key={tool} style={{ background: isToday ? 'rgba(99,102,241,0.2)' : c.pill, border: `1px solid ${isToday ? 'rgba(99,102,241,0.3)' : 'transparent'}` }}
                        className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-1 sm:py-1.5 rounded-md sm:rounded-lg font-medium leading-snug">
                        <span style={{ color: isToday ? '#c7d2fe' : c.text }}>{tool}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
