import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { addDoc, collection } from 'firebase/firestore'
import { useQueryClient } from '@tanstack/react-query'
import { calculateActivityCalories } from '@repo/shared'
import { useAuth } from '../../hooks/useAuth'
import { useLatestBodyMetrics } from '../../hooks/useBodyMetrics'
import { db } from '../../lib/firebase'

interface ManualActivityModalProps {
  isOpen: boolean
  onClose: () => void
  selectedType: string
}

const activities = [
  { id: 'strength', title: 'Strength' },
  { id: 'cardio', title: 'Cardio' },
  { id: 'hiit', title: 'HIIT' },
  { id: 'yoga', title: 'Yoga' },
  { id: 'swimming', title: 'Swimming' },
  { id: 'sports', title: 'Sports' },
  { id: 'walking', title: 'Walking' },
]

export function ManualActivityModal({ isOpen, onClose, selectedType }: ManualActivityModalProps) {
  const { user } = useAuth()
  const { data: metrics } = useLatestBodyMetrics(user?.uid)
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [manualType, setManualType] = useState(selectedType)
  const [startDateTime, setStartDateTime] = useState<string>(() => {
    const now = new Date()
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
    now.setMinutes(now.getMinutes() - 30)
    return now.toISOString().slice(0, 16)
  })
  const [endDateTime, setEndDateTime] = useState<string>(() => {
    const now = new Date()
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
    return now.toISOString().slice(0, 16)
  })

  useEffect(() => {
    if (isOpen) {
      setManualType(selectedType)
    }
  }, [isOpen, selectedType])

  const handleLogPastActivity = async () => {
    if (!user) return
    setIsSubmitting(true)

    try {
      const start = new Date(startDateTime)
      const end = new Date(endDateTime)
      const now = new Date()

      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        alert('Please provide valid start and end date/time.')
        return
      }

      if (start > now || end > now) {
        alert('Past activity cannot be in the future.')
        return
      }

      if (end <= start) {
        alert('End time must be after start time.')
        return
      }

      const durationMinutes = Math.max(1, Math.round((end.getTime() - start.getTime()) / 60000))
      const caloriesBurned = calculateActivityCalories(
        manualType,
        durationMinutes,
        metrics?.weight || 70
      )
      const localStart = new Date(start.getTime() - start.getTimezoneOffset() * 60000)

      await addDoc(collection(db, 'activityLogs'), {
        userId: user.uid,
        type: manualType,
        durationMinutes,
        caloriesBurned,
        timestamp: start.toISOString(),
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        status: 'completed',
        date: localStart.toISOString().slice(0, 10),
      })

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['activityLogs', 'today', user.uid] }),
        queryClient.invalidateQueries({ queryKey: ['activityLogs', 'weekly', user.uid] }),
        queryClient.invalidateQueries({ queryKey: ['activityLogs', 'running', user.uid] }),
      ])

      onClose()
    } catch (error) {
      console.error('Error logging past activity:', error)
      alert('Failed to log past activity')
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
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            className="relative w-full max-w-lg bg-gray-900 border border-white/10 rounded-3xl shadow-2xl p-6"
          >
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">Manual Activity</h2>
                <p className="text-sm text-gray-400">Log a completed past activity</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Activity Type
                </label>
                <select
                  value={manualType}
                  onChange={e => setManualType(e.target.value)}
                  className="mt-2 w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#a3e635]/50 transition-all"
                >
                  {activities.map(activity => (
                    <option key={activity.id} value={activity.id} className="bg-gray-900">
                      {activity.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Start Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={startDateTime}
                  max={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000)
                    .toISOString()
                    .slice(0, 16)}
                  onChange={e => setStartDateTime(e.target.value)}
                  className="mt-2 w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#a3e635]/50 transition-all [color-scheme:dark]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  End Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={endDateTime}
                  max={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000)
                    .toISOString()
                    .slice(0, 16)}
                  onChange={e => setEndDateTime(e.target.value)}
                  className="mt-2 w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#a3e635]/50 transition-all [color-scheme:dark]"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-5 py-3 rounded-xl text-white border border-white/15 bg-white/5 hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogPastActivity}
                disabled={isSubmitting}
                className="flex-1 px-5 py-3 rounded-xl font-bold text-black bg-[#a3e635] hover:bg-[#bef264] transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Activity'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
