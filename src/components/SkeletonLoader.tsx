function Bone({ style }: { style?: React.CSSProperties }) {
  return <div className="skeleton-bone" style={{ borderRadius: 8, ...style }} />
}

export default function SkeletonLoader() {
  return (
    <div className="animate-fade-up">
      {/* Hero skeleton */}
      <div className="text-center mb-8 sm:mb-10 space-y-3">
        <Bone style={{ width: 180, height: 24, borderRadius: 100, margin: '0 auto' }} />
        <Bone style={{ width: '60%', maxWidth: 340, height: 40, borderRadius: 12, margin: '0 auto' }} />
        <Bone style={{ width: 200, height: 16, borderRadius: 8, margin: '0 auto' }} />
      </div>

      {/* StatsBar */}
      <Bone style={{ height: 84, borderRadius: 20, marginBottom: 24 }} />

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mb-6">
        {[0, 1, 2].map(i => <Bone key={i} style={{ height: 160, borderRadius: 20 }} />)}
      </div>

      {/* Tool breakdown */}
      <Bone style={{ height: 300, borderRadius: 20, marginBottom: 24 }} />

      {/* Weekly schedule */}
      <Bone style={{ height: 220, borderRadius: 20, marginBottom: 24 }} />

      {/* Mid grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Bone style={{ height: 280, borderRadius: 20 }} />
        <Bone style={{ height: 280, borderRadius: 20 }} />
      </div>

      {/* GitLab */}
      <Bone style={{ height: 320, borderRadius: 20 }} />
    </div>
  )
}
