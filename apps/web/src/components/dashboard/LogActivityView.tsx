import { useState } from 'react'
import { motion } from 'framer-motion'
import { collection, addDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useAuth } from '../../hooks/useAuth'
import { useLatestBodyMetrics } from '../../hooks/useBodyMetrics'
import { calculateActivityCalories } from '@repo/shared'
import { useQueryClient } from '@tanstack/react-query'

const activities = [
  { id: 'strength', title: 'Strength', icon: '💪' },
  { id: 'cardio', title: 'Cardio', icon: '🏃' },
  { id: 'hiit', title: 'HIIT', icon: '⚡' },
  { id: 'yoga', title: 'Yoga', icon: '🧘' },
  { id: 'swimming', title: 'Swimming', icon: '🏊' },
  { id: 'sports', title: 'Sports', icon: '⚽' },
  { id: 'walking', title: 'Walking', icon: '🚶' },
]

export function LogActivityView({ onBack }: { onBack: () => void }) {
  const { user } = useAuth()
  const { data: metrics } = useLatestBodyMetrics(user?.uid)
  const queryClient = useQueryClient()

  const [selectedType, setSelectedType] = useState<string>('cardio')
  const [duration, setDuration] = useState<number>(30)
  const [logDate, setLogDate] = useState<string>(() => {
    const now = new Date()
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
    return now.toISOString().slice(0, 16)
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleLogActivity = async () => {
    if (!user) return
    setIsSubmitting(true)

    try {
      const selectedDate = new Date(logDate)
      const now = new Date()

      if (selectedDate > now) {
        alert('Cannot log activities in the future.')
        setIsSubmitting(false)
        return
      }

      const weight = metrics?.weight || 70
      // Calculate estimated calories
      // Note: calculateActivityCalories is a hypothetical helper, ensure it exists or implement simple logic
      const caloriesBurned = calculateActivityCalories(selectedType, duration, weight)

      await addDoc(collection(db, 'activityLogs'), {
        userId: user.uid,
        type: selectedType,
        durationMinutes: duration,
        caloriesBurned: caloriesBurned,
        timestamp: selectedDate.toISOString(),
        date: selectedDate.toISOString().split('T')[0], // YYYY-MM-DD
      })

      // Invalidate queries to refresh dashboard
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['activityLogs', 'today', user.uid] }),
        queryClient.invalidateQueries({ queryKey: ['activityLogs', 'weekly', user.uid] }),
      ])

      onBack()
    } catch (error) {
      console.error('Error logging activity:', error)
      alert('Failed to log activity')
    } finally {
      setIsSubmitting(false)
    }
  }

  const currentCalories = calculateActivityCalories(selectedType, duration, metrics?.weight || 70)

  return (
    <motion.div className="max-w-4xl mx-auto pb-24 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Log Activity</h1>
        <p className="text-gray-400 text-sm">Record your workout session</p>
      </div>

      <div className="grid grid-cols-1 gap-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#a3e635]/5 to-transparent blur-3xl -z-10 pointer-events-none" />

        {/* Activity Type Selection */}
        <div className="bg-gradient-to-r from-gray-900/80 to-black/40 border border-white/10 rounded-3xl p-6 shadow-xl">
          <label className="text-sm font-bold text-gray-400 mb-4 block uppercase tracking-wider">
            Activity Type
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {activities.map(act => (
              <button
                key={act.id}
                onClick={() => setSelectedType(act.id)}
                className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                  selectedType === act.id
                    ? 'border-[#a3e635] bg-[#a3e635]/10 text-[#a3e635] shadow-[0_0_15px_rgba(163,230,53,0.2)]'
                    : 'border-white/5 bg-white/5 text-gray-400 hover:bg-white/10 hover:border-white/10'
                }`}
              >
                <span className="text-2xl">{act.icon}</span>
                <span className="text-[10px] font-black uppercase tracking-wider">{act.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Details Card */}
        <div className="bg-gradient-to-r from-gray-900/80 to-black/40 border border-white/10 rounded-3xl p-6 shadow-xl space-y-8">
          {/* Duration Slider */}
          <div>
            <div className="flex justify-between items-end mb-4">
              <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                Duration
              </label>
              <span className="text-2xl font-black text-white">
                {duration}
                <span className="text-sm text-[#a3e635] ml-1">min</span>
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="180"
              step="5"
              value={duration}
              onChange={e => setDuration(parseInt(e.target.value))}
              className="w-full h-3 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-[#a3e635] hover:accent-[#bef264] transition-all"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2 font-medium">
              <span>5m</span>
              <span>180m</span>
            </div>
          </div>

          {/* Date Picker */}
          <div>
            <label className="text-sm font-bold text-gray-400 mb-3 block uppercase tracking-wider">
              Date & Time
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400 group-focus-within:text-[#a3e635] transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <input
                type="datetime-local"
                value={logDate}
                max={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000)
                  .toISOString()
                  .slice(0, 16)}
                onChange={e => setLogDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-4 text-white font-medium focus:outline-none focus:border-[#a3e635]/50 focus:bg-white/10 transition-all [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Calorie Estimate */}
          <div className="bg-[#a3e635]/10 border border-[#a3e635]/20 rounded-2xl p-5 flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-[#a3e635] text-xs font-bold uppercase tracking-wider mb-1">
                Estimated Burn
              </span>
              <span className="text-gray-400 text-xs">Based on activity & weight</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-white">{Math.round(currentCalories)}</span>
              <span className="text-sm font-bold text-[#a3e635]">kcal</span>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-8 left-0 right-0 px-4 z-40">
        <div className="max-w-4xl mx-auto flex justify-center gap-3">
          <button
            onClick={onBack}
            className="px-8 py-4 rounded-2xl font-semibold text-lg border-2 border-white/10 text-white hover:bg-white/5 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleLogActivity}
            disabled={isSubmitting}
            className="px-8 py-4 rounded-2xl font-black text-lg bg-[#a3e635] text-black hover:bg-[#bef264] shadow-[0_10px_30px_rgba(163,230,53,0.3)] transition-all flex items-center justify-center gap-3 group disabled:opacity-50 disabled:hover:scale-100"
          >
            {isSubmitting ? 'Logging...' : 'Log Activity'}
            {!isSubmitting && (
              <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  )
}
