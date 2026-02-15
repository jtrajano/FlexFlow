import { useMemo } from 'react'
import { ActivityStatsItem } from '../../interface/ActivityStatsItem'
import { WeeklyActivityDay } from '../../interface/WeeklyActivityDay'
import { buildPerformanceInsights } from '../../pages/StatisticsPage'

export function PerformanceInsights({
  weeklyData,
  activities,
}: {
  weeklyData: Array<WeeklyActivityDay>
  activities: Array<ActivityStatsItem>
}) {
  const insights = useMemo(
    () => buildPerformanceInsights(weeklyData, activities),
    [weeklyData, activities]
  )

  return (
    <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-4 space-y-2">
      {insights.map((insight, idx) => (
        <div key={idx} className="flex items-start gap-2">
          <span className="text-indigo-400 font-black">💡</span>
          <p className="text-sm text-gray-200">{insight}</p>
        </div>
      ))}
    </div>
  )
}
