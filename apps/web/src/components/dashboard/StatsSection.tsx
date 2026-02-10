import React from 'react'

// Reusable Stat Card Component
function StatCard({
  icon,
  label,
  value,
  unit,
  change,
  iconColor = 'text-green-500',
  iconBg = 'bg-green-500/10',
}: {
  icon: React.ReactNode
  label: string
  value: string
  unit: string
  change?: string
  iconColor?: string
  iconBg?: string
}) {
  return (
    <div className="bg-gray-900 rounded-2xl p-4 border border-border/50 relative overflow-hidden">
      <div className="flex justify-between items-start mb-2">
        <div className={`p-2 rounded-xl ${iconBg} ${iconColor}`}>{icon}</div>
        {change && (
          <span className="text-green-400 text-xs font-bold bg-green-900/20 px-2 py-1 rounded-full">
            {change}
          </span>
        )}
      </div>

      <div className="mt-2">
        <p className="text-muted-foreground text-xs font-medium mb-1">{label}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-white">{value}</span>
          <span className="text-xs text-muted-foreground">{unit}</span>
        </div>
      </div>
    </div>
  )
}

export function StatsSection() {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-white mb-4">Your Stats</h3>

      <div className="grid grid-cols-2 gap-4">
        {/* Calories */}
        <StatCard
          label="Calories"
          value="847"
          unit="kcal"
          change="+12%"
          icon={
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-2.246-5.364 1-9 3.931 5.865 3.867 8.657 2.001 11.232a4.482 4.482 0 0 0 .991-6.191C16.5 6.5 14 10 14 10c2.175.72 5 2.5 5 5 0 2.5-2.5 5-5 5-3.5 0-7-2-7-5.5S8.5 14.5 8.5 14.5z" />
            </svg>
          }
        />

        {/* Steps */}
        <StatCard
          label="Steps"
          value="8,432"
          unit="steps"
          change="+8%"
          icon={
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 11 3.8 11 8c0 2.87-.27 3.63-2 5M12 22v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C6.63 8 5 9.8 5 14c0 2.87.27 3.63 2 5" />
              <path d="M12 22h2a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-3" />
              <path d="M6 16h2a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2H5" />
            </svg>
          }
        />

        {/* Active Time */}
        <StatCard
          label="Active Time"
          value="1h 24"
          unit="min"
          change="+5%"
          icon={
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          }
        />

        {/* Heart Rate */}
        <StatCard
          label="Avg Heart Rate"
          value="72"
          unit="bpm"
          icon={
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          }
        />
      </div>
    </div>
  )
}
