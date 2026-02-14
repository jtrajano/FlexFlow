import { useMemo } from 'react'

interface ActivityType {
  type: string
  durationMinutes: number
  caloriesBurned: number
}

interface WorkoutSlice {
  type: string
  percentage: number
  path: string
  color: string
  isFullSlice: boolean
}

interface WorkoutDistributionData {
  total: number
  slices: Array<WorkoutSlice>
}

const CHART_COLORS = ['#a3e635', '#60a5fa', '#f97316', '#ec4899', '#8b5cf6', '#06b6d4']

export function buildWorkoutDistributionData(
  activities: Array<ActivityType>
): WorkoutDistributionData {
  const distribution: Record<string, number> = {}
  activities.forEach(act => {
    distribution[act.type] = (distribution[act.type] || 0) + 1
  })

  const total = Object.values(distribution).reduce((sum: number, val: number) => sum + val, 0)
  if (total === 0) {
    return { total, slices: [] }
  }

  let startAngle = -90
  const slices = Object.entries(distribution).map(([type, count], idx) => {
    const percentage = (count / total) * 100
    const angle = (percentage / 100) * 360
    const isFullSlice = angle >= 359.999
    const endAngle = startAngle + angle

    const start = startAngle * (Math.PI / 180)
    const end = endAngle * (Math.PI / 180)

    const x1 = 50 + 40 * Math.cos(start)
    const y1 = 50 + 40 * Math.sin(start)
    const x2 = 50 + 40 * Math.cos(end)
    const y2 = 50 + 40 * Math.sin(end)

    const largeArc = angle > 180 ? 1 : 0

    const path = isFullSlice ? '' : `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`

    startAngle = endAngle

    return {
      type,
      percentage: Math.round(percentage),
      path,
      color: CHART_COLORS[idx % CHART_COLORS.length],
      isFullSlice,
    }
  })

  return { total, slices }
}

/** Workout Distribution Pie Chart */
export function WorkoutDistributionChart({ activities }: { activities: Array<ActivityType> }) {
  const { total, slices } = useMemo(() => buildWorkoutDistributionData(activities), [activities])

  if (total === 0) {
    return <div className="text-center p-8 text-gray-400 text-sm">No workout data available</div>
  }

  return (
    <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-6">
      <div className="flex items-center gap-6">
        <svg width="150" height="150" viewBox="0 0 100 100" className="flex-shrink-0">
          {slices.map((slice, idx) =>
            slice.isFullSlice ? (
              <circle key={idx} cx="50" cy="50" r="40" fill={slice.color} opacity="0.8" />
            ) : (
              <path key={idx} d={slice.path} fill={slice.color} opacity="0.8" />
            )
          )}
        </svg>

        <div className="flex-1 space-y-2">
          {slices.map((slice, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: slice.color }} />
                <span className="text-xs text-gray-300 capitalize">{slice.type}</span>
              </div>
              <span className="text-sm font-bold text-white">{slice.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
