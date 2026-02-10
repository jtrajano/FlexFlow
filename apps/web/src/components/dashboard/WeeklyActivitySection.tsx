import React from 'react'

interface DayBarProps {
  day: string
  height: number
  isActive?: boolean
}

function DayBar({ day, height, isActive = false }: DayBarProps) {
  return (
    <div className="flex flex-col items-center gap-2 flex-1">
      <div className="w-full h-32 flex items-end justify-center">
        <div
          className={`w-8 rounded-t-lg transition-all ${
            isActive ? 'bg-primary' : 'bg-muted/20 hover:bg-muted/30'
          }`}
          style={{ height: `${height}%` }}
        />
      </div>
      <span
        className={`text-xs font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
      >
        {day}
      </span>
    </div>
  )
}

export function WeeklyActivitySection() {
  const weekData = [
    { day: 'Mon', height: 45, isActive: false },
    { day: 'Tue', height: 60, isActive: false },
    { day: 'Wed', height: 35, isActive: false },
    { day: 'Thu', height: 80, isActive: true },
    { day: 'Fri', height: 50, isActive: false },
    { day: 'Sat', height: 70, isActive: false },
    { day: 'Sun', height: 40, isActive: false },
  ]

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">Weekly Activity</h3>
        <button className="text-primary text-sm font-medium px-3 py-1 rounded-md bg-primary/10 hover:bg-primary/20 transition-colors">
          This Week
        </button>
      </div>

      <div className="bg-gray-900 rounded-2xl p-6 border border-border/50">
        <div className="flex gap-2 items-end">
          {weekData.map(data => (
            <DayBar key={data.day} day={data.day} height={data.height} isActive={data.isActive} />
          ))}
        </div>
      </div>
    </div>
  )
}
