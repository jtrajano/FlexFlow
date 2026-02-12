import { motion } from 'framer-motion'
import { useMemo } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useTodayActivity } from '../../hooks/useTodayActivity'
import { useWeeklyActivity } from '../../hooks/useWeeklyActivity'
import { useLatestBodyMetrics } from '../../hooks/useBodyMetrics'
import { estimateSteps } from '@repo/shared'

interface StatCardProps {
  label: string
  value: string | number
  unit: string
  icon: React.ReactNode
  color?: string
  trend?: { value: number; isPositive: boolean }
  description?: string
}

/** Reusable Stat Card Component */
function StatCard({
  label,
  value,
  unit,
  icon,
  color = 'bg-[#a3e635]',
  trend,
  description,
}: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-gray-900/50 backdrop-blur-md border border-white/10 p-5 rounded-2xl relative overflow-hidden group hover:border-white/20 transition-all"
    >
      <div
        className={`absolute top-0 right-0 w-24 h-24 ${color} opacity-5 blur-2xl -mr-10 -mt-10 rounded-full group-hover:opacity-10 transition-opacity`}
      />

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-3">
          <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">{label}</span>
          <div
            className={`p-2 rounded-xl bg-white/5 text-white ${color.replace('bg-', 'text-')}/80`}
          >
            {icon}
          </div>
        </div>

        <div className="flex items-baseline gap-1 mb-1">
          <h3 className="text-2xl font-black text-white tracking-tight">{value}</h3>
          <span className="text-xs font-medium text-gray-500">{unit}</span>
        </div>

        {trend && (
          <div
            className={`text-xs font-semibold flex items-center gap-1 ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`}
          >
            <span>{trend.isPositive ? '↑' : '↓'}</span>
            <span>{Math.abs(trend.value)}% vs last week</span>
          </div>
        )}

        {description && <p className="text-xs text-gray-500 mt-2">{description}</p>}
      </div>
    </motion.div>
  )
}

/** Mini Chart Bar Component */
function ChartBar({ height, label, value }: { height: number; label: string; value: number }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-24 w-full flex items-end justify-center">
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: `${height}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-3/4 bg-gradient-to-t from-[#a3e635] to-[#a3e635]/60 rounded-t-lg hover:from-[#b8f635] transition-colors group relative"
        >
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {value}
          </div>
        </motion.div>
      </div>
      <span className="text-xs font-medium text-gray-400">{label}</span>
    </div>
  )
}

/** Workout Distribution Pie Chart */
function WorkoutDistributionChart({
  activities,
}: {
  activities: Array<{ type: string; durationMinutes: number; caloriesBurned: number }>
}) {
  const distribution = useMemo(() => {
    const counts: Record<string, number> = {}
    activities.forEach(act => {
      counts[act.type] = (counts[act.type] || 0) + 1
    })
    return counts
  }, [activities])

  const total = Object.values(distribution).reduce((sum: number, val: number) => sum + val, 0)
  const colors = ['#a3e635', '#60a5fa', '#f97316', '#ec4899', '#8b5cf6', '#06b6d4']

  let startAngle = -90
  const slices = Object.entries(distribution).map(([type, count], idx) => {
    const percentage = ((count as number) / total) * 100
    const angle = (percentage / 100) * 360
    const endAngle = startAngle + angle

    const start = startAngle * (Math.PI / 180)
    const end = endAngle * (Math.PI / 180)

    const x1 = 50 + 40 * Math.cos(start)
    const y1 = 50 + 40 * Math.sin(start)
    const x2 = 50 + 40 * Math.cos(end)
    const y2 = 50 + 40 * Math.sin(end)

    const largeArc = angle > 180 ? 1 : 0

    const path = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`

    startAngle = endAngle

    return {
      type,
      percentage: Math.round(percentage),
      path,
      color: colors[idx % colors.length],
    }
  })

  if (total === 0) {
    return <div className="text-center p-8 text-gray-400 text-sm">No workout data available</div>
  }

  return (
    <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-6">
      <div className="flex items-center gap-6">
        <svg width="150" height="150" viewBox="0 0 100 100" className="flex-shrink-0">
          {slices.map((slice, idx) => (
            <path key={idx} d={slice.path} fill={slice.color} opacity="0.8" />
          ))}
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

/** Performance Insights */
function PerformanceInsights({
  weeklyData,
  activities,
}: {
  weeklyData: Array<{
    activities: Array<{ type: string; durationMinutes: number; caloriesBurned: number }>
  }>
  activities: Array<{ type: string; durationMinutes: number; caloriesBurned: number }>
}) {
  const insights = useMemo(() => {
    const result: string[] = []

    // Find most active day
    const dayActivity = weeklyData.map((day, idx) => ({
      idx,
      count: day.activities.length,
      day: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][idx],
    }))
    const mostActiveDay = dayActivity.reduce((a, b) => (a.count > b.count ? a : b), dayActivity[0])
    if (mostActiveDay.count > 0) {
      result.push(`You are most active on ${mostActiveDay.day}s.`)
    }

    // Workout completion rate
    const totalScheduledWorkouts = weeklyData.length * 3 // Assume 3 workouts per week planned
    const completedWorkouts = activities.length
    const completionRate = Math.round((completedWorkouts / totalScheduledWorkouts) * 100)
    if (completionRate > 0) {
      result.push(`You complete ${completionRate}% of scheduled workouts.`)
    }

    // Consistency improvement (mock - would compare to previous month)
    result.push('Keep up the momentum! You are on track this week.')

    return result
  }, [weeklyData, activities])

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

export function StatisticsPage({ onBack }: { onBack?: () => void }) {
  const { user } = useAuth()
  const { data: activities = [] } = useTodayActivity(user?.uid)
  const { data: weeklyData = [] } = useWeeklyActivity(user?.uid)
  const { data: metrics } = useLatestBodyMetrics(user?.uid)

  // Calculate today's stats
  const totalCalories = activities.reduce((sum, act) => sum + act.caloriesBurned, 0)
  const totalMinutes = activities.reduce((sum, act) => sum + act.durationMinutes, 0)
  const activitySteps = activities.reduce(
    (sum, act) => sum + estimateSteps(act.type, act.durationMinutes),
    0
  )
  const baseSteps = 2500
  const totalSteps = baseSteps + activitySteps

  // Calculate weekly stats
  const weeklyStats = useMemo(() => {
    const weeklyCalories = weeklyData.reduce(
      (sum, day) => sum + day.activities.reduce((dSum, act) => dSum + act.caloriesBurned, 0),
      0
    )
    const avgDailyCalories =
      weeklyData.length > 0 ? Math.round(weeklyCalories / weeklyData.length) : 0
    const weeklyMinutes = weeklyData.reduce(
      (sum, day) => sum + day.activities.reduce((dSum, act) => dSum + act.durationMinutes, 0),
      0
    )
    const weeklyWorkouts = weeklyData.reduce((sum, day) => sum + day.activities.length, 0)
    const activeDays = weeklyData.filter(day => day.activities.length > 0).length
    const currentStreak = weeklyData.filter(day => day.activities.length > 0).length

    return {
      weeklyCalories,
      avgDailyCalories,
      weeklyMinutes,
      weeklyWorkouts,
      activeDays,
      currentStreak,
    }
  }, [weeklyData])

  // Calculate personal records
  const personalRecords = useMemo(() => {
    const allActivities = weeklyData.flatMap(day => day.activities)

    const longestWorkout = allActivities.reduce(
      (max, act) => (act.durationMinutes > max ? act.durationMinutes : max),
      0
    )
    const highestCaloriesSession = allActivities.reduce(
      (max, act) => (act.caloriesBurned > max ? act.caloriesBurned : max),
      0
    )
    const mostSessionsInWeek = weeklyStats.weeklyWorkouts

    return {
      longestWorkout,
      highestCaloriesSession,
      mostSessionsInWeek,
      bestStreak: weeklyStats.currentStreak,
    }
  }, [weeklyData, weeklyStats])

  // Calculate goal adherence
  // Calculate goal adherence with defaults
  const weeklyWorkoutGoal = 3 // Default to 3 workouts per week
  const weeklyMinutesGoal = 150 // Default to 150 minutes per week

  const GoalAdherenceRow = ({
    label,
    planned,
    completed,
  }: {
    label: string
    planned: number
    completed: number
  }) => (
    <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
      <span className="text-sm text-gray-300">{label}</span>
      <div className="flex gap-4">
        <div className="text-right">
          <p className="text-xs text-gray-500">Planned</p>
          <p className="text-sm font-bold text-white">{planned}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Completed</p>
          <p className="text-sm font-bold text-[#a3e635]">{completed}</p>
        </div>
      </div>
    </div>
  )

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-black pb-24"
    >
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Statistics</h1>
          <p className="text-xs text-gray-400">Track your fitness progress</p>
        </div>
        {onBack && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white transition-colors"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </motion.button>
        )}
      </div>

      <div className="px-6 py-6 space-y-8">
        {/* Section 1: Weekly/Monthly Summary */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white">📊 Weekly Summary</h2>

          <div className="grid grid-cols-2 gap-4">
            <StatCard
              label="Workout Minutes"
              value={weeklyStats.weeklyMinutes}
              unit="min"
              color="bg-orange-400"
              description="This week"
              icon={
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              }
            />

            <StatCard
              label="Sessions"
              value={weeklyStats.weeklyWorkouts}
              unit="completed"
              color="bg-pink-400"
              description="This week"
              icon={
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M6 9h12M6 9a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2M9 9V7a3 3 0 0 1 6 0v2" />
                </svg>
              }
            />

            <StatCard
              label="Calories Burned"
              value={weeklyStats.weeklyCalories.toLocaleString()}
              unit="kcal"
              color="bg-green-400"
              description="This week"
              icon={
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 7c-3 0-1 10 1 12 .46.606 2.46 1 4 1s3.54-.394 4-1c2-2 4-12 1-12" />
                  <path d="M12 4v3m4-2v2m-8-2v2" />
                </svg>
              }
            />

            <StatCard
              label="Active Days"
              value={weeklyStats.activeDays}
              unit="days"
              color="bg-blue-400"
              description={`${weeklyStats.currentStreak}-day streak`}
              icon={
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m3.5 7c.83 0 1.5-.67 1.5-1.5S16.33 6 15.5 6 14 6.67 14 7.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 6 8.5 6 7 6.67 7 7.5 7.67 9 8.5 9zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                </svg>
              }
            />

            <StatCard
              label="Avg Daily Kcal"
              value={weeklyStats.avgDailyCalories}
              unit="kcal"
              color="bg-red-400"
              description="Weekly average"
              icon={
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 3v18m9-9H3" />
                </svg>
              }
            />

            <StatCard
              label="Longest Streak"
              value={weeklyStats.currentStreak}
              unit="days"
              color="bg-purple-400"
              description="Current streak"
              icon={
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
            />
          </div>
        </section>

        {/* Section 2: Weekly Trend Chart */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-white">📈 Weekly Trend</h2>
            <span className="text-xs text-gray-400">{weeklyStats.weeklyCalories} kcal total</span>
          </div>

          <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-6">
            <div className="grid grid-cols-7 gap-2">
              {weeklyData.length > 0 ? (
                weeklyData.map((day, index) => {
                  const dayCalories = day.activities.reduce(
                    (sum, act) => sum + act.caloriesBurned,
                    0
                  )
                  const maxCalories = Math.max(
                    ...weeklyData.map(d =>
                      d.activities.reduce((sum, act) => sum + act.caloriesBurned, 0)
                    )
                  )
                  const height = maxCalories > 0 ? (dayCalories / maxCalories) * 100 : 0
                  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

                  return (
                    <ChartBar
                      key={index}
                      height={Math.max(height, 10)}
                      label={dayLabels[index]}
                      value={dayCalories}
                    />
                  )
                })
              ) : (
                <div className="col-span-7 text-center p-8 text-gray-400 text-sm">
                  No weekly data available yet. Start logging workouts!
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Section 3: Goal Adherence */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white">🎯 Goal Adherence</h2>

          <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-4 space-y-2">
            <GoalAdherenceRow
              label="Workout Sessions"
              planned={weeklyWorkoutGoal}
              completed={weeklyStats.weeklyWorkouts}
            />
            <GoalAdherenceRow
              label="Weekly Minutes"
              planned={Math.round(weeklyMinutesGoal)}
              completed={weeklyStats.weeklyMinutes}
            />
            <GoalAdherenceRow
              label="Active Hours"
              planned={weeklyWorkoutGoal * 1.5}
              completed={Math.round(weeklyStats.weeklyMinutes / 60)}
            />
          </div>
        </section>

        {/* Section 4: Workout Distribution */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white">💪 Workout Distribution</h2>
          <WorkoutDistributionChart activities={activities} />
        </section>

        {/* Section 5: Personal Records */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white">🏆 Personal Records</h2>

          <div className="grid grid-cols-2 gap-4">
            <StatCard
              label="Longest Workout"
              value={personalRecords.longestWorkout}
              unit="min"
              color="bg-cyan-400"
              icon={
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              }
            />

            <StatCard
              label="Highest Calories"
              value={personalRecords.highestCaloriesSession}
              unit="kcal"
              color="bg-yellow-400"
              icon={
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 7c-3 0-1 10 1 12 .46.606 2.46 1 4 1s3.54-.394 4-1c2-2 4-12 1-12" />
                  <path d="M12 4v3m4-2v2m-8-2v2" />
                </svg>
              }
            />

            <StatCard
              label="Sessions/Week"
              value={personalRecords.mostSessionsInWeek}
              unit="best"
              color="bg-rose-400"
              icon={
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M6 9h12M6 9a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2M9 9V7a3 3 0 0 1 6 0v2" />
                </svg>
              }
            />

            <StatCard
              label="Best Streak"
              value={personalRecords.bestStreak}
              unit="days"
              color="bg-lime-400"
              icon={
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
            />
          </div>
        </section>

        {/* Section 6: Performance Insights */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white">✨ Performance Insights</h2>
          <PerformanceInsights weeklyData={weeklyData} activities={activities} />
        </section>

        {/* Today's Focus - Bottom Section */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white">Today's Focus</h2>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-[#a3e635]/20 to-green-900/20 border border-[#a3e635]/20 rounded-3xl p-8 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#a3e635]/10 blur-[80px] rounded-full -mr-32 -mt-32 pointer-events-none" />

            <div className="relative z-10 text-center space-y-3">
              <p className="text-[#a3e635] font-black uppercase tracking-widest text-xs">
                Total Energy Burned
              </p>
              <h3 className="text-5xl font-black text-white">
                {totalCalories}
                <span className="text-xl text-gray-500 ml-2">kcal</span>
              </h3>
              <div className="inline-block bg-black/30 backdrop-blur-sm border border-white/5 rounded-full px-4 py-1.5 text-xs text-gray-300 font-medium">
                🔥 {formatTime(totalMinutes)} active time
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-4">
            <StatCard
              label="Steps"
              value={totalSteps.toLocaleString()}
              unit="steps"
              color="bg-blue-400"
              icon={
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 11 3.8 11 8c0 2.87-.27 3.63-2 5M12 22v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C6.63 8 5 9.8 5 14c0 2.87.27 3.63 2 5" />
                  <path d="M12 22h2a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-3" />
                  <path d="M6 16h2a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2H5" />
                </svg>
              }
            />

            <StatCard
              label="Workouts"
              value={activities.length}
              unit="sessions"
              color="bg-pink-400"
              icon={
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M6 9h12M6 9a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2M9 9V7a3 3 0 0 1 6 0v2" />
                </svg>
              }
            />
          </div>
        </section>

        {/* Body Metrics */}
        {metrics && (
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-white">📏 Body Metrics</h2>

            <div className="grid grid-cols-2 gap-4">
              <StatCard
                label="Weight"
                value={metrics.weight}
                unit="kg"
                color="bg-amber-400"
                icon={
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="5" r="3" />
                    <path d="M6.5 9c-1.66 0-3 1.34-3 3v3c0 1.66 1.34 3 3 3h11c1.66 0 3-1.34 3-3v-3c0-1.66-1.34-3-3-3" />
                  </svg>
                }
              />

              {metrics.bodyFatPercent !== null && (
                <StatCard
                  label="Body Fat %"
                  value={metrics.bodyFatPercent}
                  unit="%"
                  color="bg-red-400"
                  icon={
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <ellipse cx="12" cy="12" rx="9" ry="7" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  }
                />
              )}
            </div>
          </section>
        )}
      </div>
    </motion.div>
  )
}
