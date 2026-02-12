import { useState } from 'react'
import { motion } from 'framer-motion'
import { collection, addDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useAuth } from '../../hooks/useAuth'
import { useQueryClient } from '@tanstack/react-query'
import { useRunningActivity } from '../../hooks/useRunningActivity'
import { ManualActivityModal } from './ManualActivityModal'

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
  const [isManualModalOpen, setIsManualModalOpen] = useState(false)
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
      <div className="sticky top-0 z-20 bg-black/40 backdrop-blur-md py-4 -mx-4 px-4 flex items-center justify-between border-b border-white/5">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter">Log Activity</h1>
          <p className="text-gray-400 text-sm">
            Start live activity or open Manual Activity for past sessions.
          </p>
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

        <div className="bg-gradient-to-r from-gray-900/80 to-black/40 border border-white/10 rounded-3xl p-6 shadow-xl">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleStartActivity}
              disabled={isSubmitting || !!runningActivity}
              className="h-full rounded-2xl border border-[#a3e635]/30 bg-[#a3e635]/10 p-5 text-left transition-all hover:bg-[#a3e635]/15 disabled:opacity-60"
            >
              <p className="text-xs font-bold uppercase tracking-widest text-[#a3e635]">
                Live Session (Start Now)
              </p>
              <p className="mt-2 text-sm text-gray-300">
                Start creates an in-progress activity and returns to dashboard immediately.
              </p>
              <p className="mt-1 text-sm text-gray-300">
                The dashboard shows elapsed time from start time until you press Stop.
              </p>
              <p className="mt-3 text-sm font-bold text-white">
                {runningActivity ? 'Activity In Progress' : isSubmitting ? 'Starting...' : 'Start'}
              </p>
            </button>

            <button
              onClick={() => setIsManualModalOpen(true)}
              className="h-full w-full rounded-2xl border border-white/15 bg-white/5 p-5 text-left transition-all hover:bg-white/10 hover:border-white/25"
            >
              <p className="text-xs font-bold uppercase tracking-widest text-gray-300">
                Manual Activity
              </p>
              <p className="mt-2 text-sm text-gray-300">
                Log a completed past activity using start and end date/time.
              </p>
            </button>
          </div>
        </div>
      </div>
      <ManualActivityModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        selectedType={selectedType}
      />
    </motion.div>
  )
}
