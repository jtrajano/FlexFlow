import { useState } from 'react'
import { motion } from 'framer-motion'
import { collection, addDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useAuth } from '../../hooks/useAuth'
import { useQueryClient } from '@tanstack/react-query'
import { useRunningActivity } from '../../hooks/useRunningActivity'

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
  const { data: runningActivity } = useRunningActivity(user?.uid)
  const queryClient = useQueryClient()

  const [selectedType, setSelectedType] = useState<string>('cardio')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleStartActivity = async () => {
    if (!user) return
    if (runningActivity) {
      alert('You already have an activity in progress.')
      onBack()
      return
    }
    setIsSubmitting(true)

    try {
      const now = new Date()
      const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 10)

      await addDoc(collection(db, 'activityLogs'), {
        userId: user.uid,
        type: selectedType,
        durationMinutes: 0,
        caloriesBurned: 0,
        timestamp: now.toISOString(),
        startTime: now.toISOString(),
        status: 'in_progress',
        date: localDate,
      })

      // Invalidate queries to refresh dashboard
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['activityLogs', 'today', user.uid] }),
        queryClient.invalidateQueries({ queryKey: ['activityLogs', 'weekly', user.uid] }),
        queryClient.invalidateQueries({ queryKey: ['activityLogs', 'running', user.uid] }),
      ])

      onBack()
    } catch (error) {
      console.error('Error starting activity:', error)
      alert('Failed to start activity')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div className="max-w-4xl mx-auto pb-24 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Start Activity</h1>
        <p className="text-gray-400 text-sm">
          Start now, then stop from the dashboard when your workout is done.
        </p>
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

        <div className="bg-gradient-to-r from-gray-900/80 to-black/40 border border-white/10 rounded-3xl p-6 shadow-xl space-y-8">
          <div className="rounded-2xl border border-[#a3e635]/30 bg-[#a3e635]/10 p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-[#a3e635]">
              Live Session
            </p>
            <p className="mt-2 text-sm text-gray-300">
              Start creates an in-progress activity and returns to dashboard immediately.
            </p>
            <p className="mt-1 text-sm text-gray-300">
              The dashboard shows elapsed time from start time until you press Stop.
            </p>
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
            onClick={handleStartActivity}
            disabled={isSubmitting || !!runningActivity}
            className="px-8 py-4 rounded-2xl font-black text-lg bg-[#a3e635] text-black hover:bg-[#bef264] shadow-[0_10px_30px_rgba(163,230,53,0.3)] transition-all flex items-center justify-center gap-3 group disabled:opacity-50 disabled:hover:scale-100"
          >
            {runningActivity ? 'Activity In Progress' : isSubmitting ? 'Starting...' : 'Start'}
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
