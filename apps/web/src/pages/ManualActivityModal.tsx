import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { addDoc, collection } from 'firebase/firestore'
import { useQueryClient } from '@tanstack/react-query'
import { calculateActivityCalories } from '@repo/shared'
import { useAuth } from '../hooks/useAuth'
import { useLatestBodyMetrics } from '../hooks/useBodyMetrics'
import { db } from '../lib/firebase'

interface ManualActivityModalProps {
  isOpen: boolean
  onClose: () => void
  selectedType: string
}

type Difficulty = 'easy' | 'medium' | 'hard'

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
  const [notes, setNotes] = useState('')
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null)
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
  const [durationMinutes, setDurationMinutes] = useState(30)

  useEffect(() => {
    if (isOpen) {
      setManualType(selectedType)
      setNotes('')
      setDifficulty(null)
    }
  }, [isOpen, selectedType])

  // Sync duration when start or end time changes
  useEffect(() => {
    const start = new Date(startDateTime)
    const end = new Date(endDateTime)
    if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && end > start) {
      const calculatedMinutes = Math.round((end.getTime() - start.getTime()) / 60000)
      setDurationMinutes(calculatedMinutes)
    }
  }, [startDateTime, endDateTime])

  // Update start time when duration is manually changed
  const handleDurationChange = (minutes: number) => {
    setDurationMinutes(minutes)
    const end = new Date(endDateTime)
    if (!Number.isNaN(end.getTime()) && minutes > 0) {
      const newStart = new Date(end.getTime() - minutes * 60000)
      newStart.setMinutes(newStart.getMinutes() - newStart.getTimezoneOffset())
      setStartDateTime(newStart.toISOString().slice(0, 16))
    }
  }

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
        difficulty,
        notes,
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

  const handleShare = () => {
    const start = new Date(startDateTime)
    const end = new Date(endDateTime)
    const validTimes = !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && end > start
    const minutes = validTimes
      ? Math.max(1, Math.round((end.getTime() - start.getTime()) / 60000))
      : durationMinutes
    const calories = calculateActivityCalories(manualType, minutes, metrics?.weight || 70)
    const text = `Completed a ${manualType} workout!\n${minutes} minutes • ${calories} calories burned`

    if (navigator.share) {
      navigator
        .share({
          title: 'Workout Complete!',
          text,
        })
        .catch(err => console.log('Error sharing:', err))
    } else {
      navigator.clipboard.writeText(text)
      alert('Workout summary copied to clipboard!')
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
              <div className="grid grid-cols-2 gap-3">
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
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={durationMinutes}
                    onChange={e => handleDurationChange(parseInt(e.target.value) || 1)}
                    className="mt-2 w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#a3e635]/50 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
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

              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
                  Difficulty
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['easy', 'medium', 'hard'] as const).map(level => (
                    <button
                      key={level}
                      onClick={() => setDifficulty(level)}
                      className={`px-3 py-2 rounded-lg text-xs font-bold capitalize transition-all ${
                        difficulty === level
                          ? 'bg-[#a3e635] text-black border border-[#a3e635]'
                          : 'bg-black/30 text-gray-300 border border-white/10 hover:border-white/20'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="How did this workout feel?"
                  rows={3}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-[#a3e635]/50 transition-all resize-none"
                />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={handleShare}
                className="w-full px-5 py-3 rounded-xl font-bold text-white border border-white/15 bg-gradient-to-r from-purple-600/20 to-blue-600/20 hover:from-purple-600/30 hover:to-blue-600/30 transition-all flex items-center justify-center gap-2"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
                Share
              </button>
              <button
                onClick={handleLogPastActivity}
                disabled={isSubmitting}
                className="w-full px-5 py-3 rounded-xl font-bold text-black bg-[#a3e635] hover:bg-[#bef264] transition-colors disabled:opacity-50"
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
