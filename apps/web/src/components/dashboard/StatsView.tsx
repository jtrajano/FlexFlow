import { motion } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import { useTodayActivity } from '../../hooks/useTodayActivity'
import { useWeeklyActivity } from '../../hooks/useWeeklyActivity'
import { useLatestBodyMetrics } from '../../hooks/useBodyMetrics'
import { estimateSteps } from '@repo/shared'
import { isCompletedActivity } from '../../utils/activity-log'

interface StatCardProps {
  label: string
  value: string | number
  unit?: string
  icon: React.ReactNode
  color?: string
}

function StatCard({ label, value, unit, icon, color = 'bg-[#a3e635]' }: StatCardProps) {
  return (
    <div className="bg-gray-900/50 backdrop-blur-md border border-white/10 p-5 rounded-3xl flex flex-col justify-between h-32 relative overflow-hidden group hover:border-white/20 transition-all">
      <div
        className={`absolute top-0 right-0 w-24 h-24 ${color} opacity-5 blur-2xl -mr-10 -mt-10 rounded-full group-hover:opacity-10 transition-opacity`}
      />

      <div className="flex justify-between items-start z-10">
        <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">{label}</span>
        <div className={`p-2 rounded-xl bg-white/5 text-white ${color.replace('bg-', 'text-')}/80`}>
          {icon}
        </div>
      </div>

      <div className="flex items-baseline gap-1 z-10">
        <h3 className="text-3xl font-black text-white tracking-tight">{value}</h3>
        <span className="text-xs font-medium text-gray-500">{unit}</span>
      </div>
    </div>
  )
}

export function StatsView({ onBack }: { onBack: () => void }) {
  const { user } = useAuth()
  const { data: activities } = useTodayActivity(user?.uid)
  const { data: weeklyData } = useWeeklyActivity(user?.uid)
  const { data: metrics } = useLatestBodyMetrics(user?.uid)
  const completedActivities = activities?.filter(isCompletedActivity) || []

  const totalCalories = completedActivities.reduce((sum, act) => sum + act.caloriesBurned, 0)
  const totalMinutes = completedActivities.reduce((sum, act) => sum + act.durationMinutes, 0)

  const activitySteps = completedActivities.reduce(
    (sum, act) => sum + estimateSteps(act.type, act.durationMinutes),
    0
  )
  const baseSteps = 2500
  const totalSteps = baseSteps + activitySteps

  // Example Weekly Totals
  const weeklyCalories =
    weeklyData?.reduce(
      (sum, day) => sum + day.activities.reduce((dSum, act) => dSum + act.caloriesBurned, 0),
      0
    ) || 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8 pb-24"
    >
      <div className="sticky top-0 z-20 bg-black/40 backdrop-blur-md py-4 -mx-4 px-4 flex items-center justify-between border-b border-white/5">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter">Your Stats</h1>
          <p className="text-gray-400 text-sm">Comprehensive performance metrics</p>
        </div>
        <button
          onClick={onBack}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-white transition-colors"
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
        </button>
      </div>

      {/* Hero Stat: Today's Activity */}
      <div className="bg-gradient-to-br from-[#a3e635]/20 to-green-900/20 border border-[#a3e635]/20 rounded-[2rem] p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#a3e635]/10 blur-[80px] rounded-full -mr-20 -mt-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center space-y-2">
          <span className="text-[#a3e635] font-black uppercase tracking-widest text-xs">
            Today's Focus
          </span>
          <h2 className="text-6xl font-black text-white tracking-tighter loading-none">
            {totalCalories}
            <span className="text-2xl text-gray-500 ml-2 font-bold">kcal</span>
          </h2>
          <div className="bg-black/30 backdrop-blur-sm border border-white/5 rounded-full px-4 py-1.5 text-xs text-gray-300 font-medium">
            🔥{' '}
            {weeklyCalories > 0
              ? `+${Math.round((totalCalories / (weeklyCalories / 7)) * 100)}% vs Weekly Avg`
              : 'Keep pushing!'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <StatCard
          label="Steps"
          value={totalSteps.toLocaleString()}
          unit="steps"
          color="bg-blue-400"
          icon={
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 11 3.8 11 8c0 2.87-.27 3.63-2 5M12 22v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C6.63 8 5 9.8 5 14c0 2.87.27 3.63 2 5" />
              <path d="M12 22h2a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-3" />
              <path d="M6 16h2a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2H5" />
            </svg>
          }
        />
        <StatCard
          label="Active Time"
          value={Math.round(totalMinutes)}
          unit="min"
          color="bg-orange-400"
          icon={
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          }
        />
        <StatCard
          label="Weight"
          value={metrics?.weight || '--'}
          unit="kg"
          color="bg-purple-400"
          icon={
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M12 3v18" />
              <path d="M5 10h14" />
              <path d="M5 14h14" />
            </svg>
          }
        />
        <StatCard
          label="Workouts"
          value={completedActivities.length}
          unit="sessions"
          color="bg-pink-400"
          icon={
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M18 6l-6 12-6-12" />
            </svg>
          }
        />
      </div>

      {/* Weekly Trend (Placeholder for Chart) */}
      <div className="bg-gray-900/50 border border-white/5 rounded-3xl p-6">
        <h3 className="text-white font-bold mb-4">Weekly Trend</h3>
        <div className="h-32 flex items-end justify-between gap-2">
          {[35, 60, 45, 80, 50, 70, 40].map((h, i) => (
            <div
              key={i}
              className="flex-1 bg-white/5 hover:bg-[#a3e635] transition-colors rounded-t-lg group relative"
              style={{ height: `${h}%` }}
            >
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {h * 10} kcal
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2 font-medium">
          <span>M</span>
          <span>T</span>
          <span>W</span>
          <span>T</span>
          <span>F</span>
          <span>S</span>
          <span>S</span>
        </div>
      </div>
    </motion.div>
  )
}
