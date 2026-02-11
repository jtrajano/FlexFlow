import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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

interface LogActivityModalProps {
  isOpen: boolean
  onClose: () => void
}

export function LogActivityModal({ isOpen, onClose }: LogActivityModalProps) {
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
      const weight = metrics?.weight || 70
      const caloriesBurned = calculateActivityCalories(selectedType, duration, weight)

      const selectedDate = new Date(logDate)

      await addDoc(collection(db, 'activityLogs'), {
        userId: user.uid,
        type: selectedType,
        durationMinutes: duration,
        caloriesBurned: caloriesBurned,
        timestamp: selectedDate.toISOString(),
        date: selectedDate.toLocaleDateString('en-CA'), // YYYY-MM-DD (local)
      })

      // Invalidate queries to refresh dashboard
      queryClient.invalidateQueries({ queryKey: ['activityLogs', 'today', user.uid] })
      queryClient.invalidateQueries({ queryKey: ['activityLogs', 'weekly', user.uid] })
      onClose()
    } catch (error) {
      console.error('Error logging activity:', error)
      alert('Failed to log activity')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-gray-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
          >
            <div className="p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Log Activity</h2>

              <div className="space-y-6">
                {/* Activity Type Selection */}
                <div>
                  <label className="text-sm font-medium text-gray-400 mb-3 block">
                    Activity Type
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {activities.map(act => (
                      <button
                        key={act.id}
                        onClick={() => setSelectedType(act.id)}
                        className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                          selectedType === act.id
                            ? 'border-[#a3e635] bg-[#a3e635]/10 text-[#a3e635]'
                            : 'border-white/5 bg-white/5 text-gray-400'
                        }`}
                      >
                        <span className="text-xl">{act.icon}</span>
                        <span className="text-[10px] font-bold uppercase">{act.title}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration Picker */}
                <div>
                  <label className="text-sm font-medium text-gray-400 mb-3 block">
                    Duration (minutes)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="5"
                      max="120"
                      step="5"
                      value={duration}
                      onChange={e => setDuration(parseInt(e.target.value))}
                      className="flex-1 h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-[#a3e635]"
                    />
                    <span className="text-xl font-bold text-white w-16 text-right">
                      {duration}m
                    </span>
                  </div>
                </div>

                {/* Date Picker */}
                <div>
                  <label className="text-sm font-medium text-gray-400 mb-3 block">
                    Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={logDate}
                    onChange={e => setLogDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#a3e635] transition-colors [color-scheme:dark]"
                  />
                </div>

                {/* Estimated Calories */}
                <div className="bg-[#a3e635]/5 border border-[#a3e635]/20 rounded-2xl p-4 flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Estimated Burn</span>
                  <span className="text-[#a3e635] font-bold text-xl">
                    {calculateActivityCalories(selectedType, duration, metrics?.weight || 70)} kcal
                  </span>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-4 rounded-2xl font-semibold text-gray-400 bg-white/5 hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogActivity}
                  disabled={isSubmitting}
                  className="flex-[2] px-6 py-4 rounded-2xl font-bold text-gray-900 bg-[#a3e635] hover:bg-[#bef264] transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Logging...' : 'Log Activity'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
