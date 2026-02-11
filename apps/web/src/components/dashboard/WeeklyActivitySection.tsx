import { useAuth } from '../../hooks/useAuth'
import { useWeeklyActivity } from '../../hooks/useWeeklyActivity'
import { useUserGoals } from '../../hooks/useUserGoals'

interface DayBarProps {
  day: string
  height: number
  isActive?: boolean
}

function DayBar({ day, height, isActive = false }: DayBarProps) {
  return (
    <div className="flex flex-col items-center gap-2 flex-1 group">
      <div className="w-full h-32 flex items-end justify-center">
        <div
          className={`w-8 rounded-t-lg transition-all ${
            isActive ? 'bg-primary' : 'bg-muted/20 group-hover:bg-muted/30'
          }`}
          style={{ height: `${Math.max(5, height)}%` }}
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
  const { user } = useAuth()
  const { data: weeklyData, isLoading: activityLoading } = useWeeklyActivity(user?.uid)
  const { data: goals, isLoading: goalsLoading } = useUserGoals(user?.uid)

  if (activityLoading || goalsLoading) {
    return (
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-white mb-4">Weekly Activity</h3>
        <div className="bg-gray-900 rounded-2xl p-6 border border-border/50 animate-pulse h-48"></div>
      </div>
    )
  }

  const todayStr = new Date().toLocaleDateString('en-CA')
  const dailyExerciseTarget = goals?.dailyExerciseTarget || 30

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">Weekly Activity</h3>
        <button className="text-primary text-sm font-medium px-3 py-1 rounded-md bg-primary/10 hover:bg-primary/20 transition-colors">
          Last 7 Days
        </button>
      </div>

      <div className="bg-gray-900 rounded-2xl p-6 border border-border/50">
        <div className="flex gap-2 items-end">
          {weeklyData?.map(day => {
            const totalMins = day.activities.reduce((sum, act) => sum + act.durationMinutes, 0)
            // Height based on duration relative to daily target
            const height = Math.min((totalMins / dailyExerciseTarget) * 100, 100)

            return (
              <DayBar
                key={day.date}
                day={day.dayName}
                height={height}
                isActive={day.date === todayStr}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
