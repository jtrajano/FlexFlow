import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { ActivityLog } from '@repo/shared'

interface WorkoutCompletedModalProps {
  isOpen: boolean
  onClose: () => void
  activity: ActivityLog
}

type Difficulty = 'easy' | 'medium' | 'hard'

export function WorkoutCompletedModal({ isOpen, onClose, activity }: WorkoutCompletedModalProps) {
  const [notes, setNotes] = useState(activity.notes || '')
  const [difficulty, setDifficulty] = useState<Difficulty | null>(
    (activity.difficulty as Difficulty) || null
  )
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const activityRef = doc(db, 'activityLogs', activity.uid)
      await updateDoc(activityRef, {
        notes,
        difficulty,
      })
      onClose()
    } catch (error) {
      console.error('Error saving workout notes:', error)
      alert('Failed to save notes')
    } finally {
      setIsSaving(false)
    }
  }

  const handleShare = () => {
    const text = `Just completed a ${activity.type} workout! 💪\n${activity.durationMinutes} minutes • ${activity.caloriesBurned} calories burned`

    if (navigator.share) {
      navigator
        .share({
          title: 'Workout Complete!',
          text,
        })
        .catch(err => console.log('Error sharing:', err))
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(text)
      alert('Workout summary copied to clipboard!')
    }
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
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
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Success Header */}
            <div className="relative bg-gradient-to-br from-[#a3e635]/20 to-green-900/20 border-b border-[#a3e635]/20 p-5 text-center">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#a3e635]/10 blur-[80px] rounded-full -mr-32 -mt-32 pointer-events-none" />

              <div className="flex items-center justify-center gap-3 mb-1">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-[#a3e635]/20"
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#a3e635"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </motion.div>

                <h2 className="text-2xl font-black text-white tracking-tight">Workout Complete!</h2>
              </div>
              <p className="text-gray-400 text-sm">Great job finishing your session</p>
            </div>

            {/* Activity Summary */}
            <div className="p-6 space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-black/30 border border-white/5 rounded-2xl p-4 text-center">
                  <div className="text-[#a3e635] text-2xl font-black">
                    {formatTime(activity.durationMinutes)}
                  </div>
                  <div className="text-gray-500 text-xs font-medium mt-1">Duration</div>
                </div>

                <div className="bg-black/30 border border-white/5 rounded-2xl p-4 text-center">
                  <div className="text-orange-400 text-2xl font-black">
                    {activity.caloriesBurned}
                  </div>
                  <div className="text-gray-500 text-xs font-medium mt-1">Calories</div>
                </div>

                <div className="bg-black/30 border border-white/5 rounded-2xl p-4 text-center">
                  <div className="text-blue-400 text-2xl font-black capitalize">
                    {activity.type}
                  </div>
                  <div className="text-gray-500 text-xs font-medium mt-1">Activity</div>
                </div>
              </div>

              {/* Difficulty Rating */}
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 block">
                  How was the difficulty?
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['easy', 'medium', 'hard'] as const).map(level => (
                    <button
                      key={level}
                      onClick={() => setDifficulty(level)}
                      className={`px-4 py-3 rounded-xl font-bold text-sm capitalize transition-all ${
                        difficulty === level
                          ? 'bg-[#a3e635] text-black border-2 border-[#a3e635]'
                          : 'bg-black/30 text-gray-400 border border-white/10 hover:border-white/20'
                      }`}
                    >
                      {level === 'easy' && '😊 Easy'}
                      {level === 'medium' && '💪 Medium'}
                      {level === 'hard' && '🔥 Hard'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
                  Add Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="How did you feel? Any achievements or observations..."
                  rows={3}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-[#a3e635]/50 transition-all resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
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
                  Share Workout
                </button>

                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full px-5 py-3 rounded-xl font-bold text-black bg-[#a3e635] hover:bg-[#bef264] transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Done'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
