import React from 'react'
import { CircularProgress } from './CircularProgress'
import { useAuth } from '../../hooks/useAuth'
import { useUserGoals } from '../../hooks/useUserGoals'
import { useTodayActivity } from '../../hooks/useTodayActivity'

export function ProgressSection() {
  const { user } = useAuth()
  const { data: goals, isLoading: goalsLoading } = useUserGoals(user?.uid)
  const { data: activities, isLoading: activitiesLoading } = useTodayActivity(user?.uid)

  // Calculate Daily Totals from activity logs
  const totalCalories = activities?.reduce((sum, act) => sum + act.caloriesBurned, 0) || 0
  const totalMinutes = activities?.reduce((sum, act) => sum + act.durationMinutes, 0) || 0

  // Use pre-computed Daily Targets from Firestore
  // Default values until goals are loaded or if they don't exist
  const dailyMoveTarget = goals?.dailyMoveTarget || 500
  const dailyExerciseTarget = goals?.dailyExerciseTarget || 30
  const dailyStandTarget = 12 // Default Apple Health standard

  if (goalsLoading || activitiesLoading) {
    return (
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-white mb-4">Today's Progress</h3>
        <div className="bg-gray-900 rounded-2xl p-6 border border-border/50 animate-pulse h-48"></div>
      </div>
    )
  }

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-white mb-4">Today's Progress</h3>

      <div className="bg-gray-900 rounded-2xl p-6 border border-border/50">
        <div className="grid grid-cols-3 gap-4">
          <CircularProgress
            value={totalCalories}
            max={dailyMoveTarget}
            label="Move"
            unit="kcal"
            color="#a3e635" // lime-400
          />
          <CircularProgress
            value={totalMinutes}
            max={dailyExerciseTarget}
            label="Exercise"
            unit="min"
            color="#f97316" // orange-500
          />
          <CircularProgress
            value={8} // Placeholder current value
            max={dailyStandTarget}
            label="Stand"
            unit="hrs"
            color="#38bdf8" // sky-400
          />
        </div>
      </div>

      {/* Decorative bottom glow representing the dock/navigation highlight from the image */}
      <div className="relative h-1 mt-8 hidden">
        <div className="absolute left-1/2 transform -translate-x-1/2 bottom-0 w-1/3 h-20 bg-primary/20 blur-3xl rounded-full pointer-events-none"></div>
      </div>
    </div>
  )
}
