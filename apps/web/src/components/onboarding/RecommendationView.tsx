import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  OnboardingData,
  calculateTargets,
  FitnessTargets,
  WorkoutTypeDistribution,
} from '@repo/shared'

interface RecommendationViewProps {
  data: OnboardingData
  onComplete: (targets: FitnessTargets, hasChanges: boolean) => void
  onBack: () => void
}

export function RecommendationView({ data, onComplete, onBack }: RecommendationViewProps) {
  const [targets, setTargets] = useState<FitnessTargets>(() => calculateTargets(data))
  const [isEditing, setIsEditing] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const handleUpdateDistribution = (
    index: number,
    field: keyof WorkoutTypeDistribution,
    value: string | number
  ) => {
    const newDist = [...targets.workoutTypeDistribution]
    newDist[index] = { ...newDist[index], [field]: value }

    setHasChanges(true)
    // Recalculate totals based on the new distribution
    setTargets({
      ...targets,
      workoutTypeDistribution: newDist,
      weeklyWorkoutMinutes: newDist.reduce(
        (acc, curr) => acc + (Number(curr.weeklyMinutes) || 0),
        0
      ),
      weeklyWorkoutFrequencyTarget: newDist.reduce(
        (acc, curr) => acc + (Number(curr.weeklySessions) || 0),
        0
      ),
    })
  }

  const handleReset = () => {
    setTargets(calculateTargets(data))
    setIsEditing(false)
    setHasChanges(false)
  }

  const handleUpdateDirect = (field: keyof FitnessTargets, value: number) => {
    const updatedTargets = { ...targets, [field]: value }
    setHasChanges(true)

    // If we're updating the total minutes or sessions, scale the distribution
    if (field === 'weeklyWorkoutMinutes' || field === 'weeklyWorkoutFrequencyTarget') {
      const isMinutes = field === 'weeklyWorkoutMinutes'

      // We calculate ratios based on the initial calculation to avoid compounding rounding errors
      // or collapsing to 0.
      const initial = calculateTargets(data)
      const initialDist = initial.workoutTypeDistribution
      const initialTotal = isMinutes
        ? initial.weeklyWorkoutMinutes
        : initial.weeklyWorkoutFrequencyTarget

      if (value > 0 && initialTotal > 0) {
        let remaining = value
        updatedTargets.workoutTypeDistribution = initialDist.map((dist, idx) => {
          if (idx === initialDist.length - 1) {
            return {
              ...dist,
              [isMinutes ? 'weeklyMinutes' : 'weeklySessions']: Math.max(0, remaining),
            }
          }
          const ratio = (isMinutes ? dist.weeklyMinutes : dist.weeklySessions) / initialTotal
          const share = Math.round(ratio * value)
          const actualShare = Math.min(share, remaining)
          remaining -= actualShare
          return {
            ...dist,
            [isMinutes ? 'weeklyMinutes' : 'weeklySessions']: actualShare,
          }
        })
      }
    }

    setTargets(updatedTargets)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {/* Header Section */}
      <div className="text-center space-y-2">
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="inline-block px-4 py-1.5 rounded-full bg-[#a3e635]/10 border border-[#a3e635]/20 text-[#a3e635] text-sm font-medium mb-4"
        >
          Personalized Plan Ready
        </motion.div>
        <h1 className="text-4xl font-extrabold text-white tracking-tight">Your Recommendation</h1>
        <p className="text-gray-400 max-w-md mx-auto">
          Based on your profile and goals, we've designed the optimal path for your transformation.
        </p>
      </div>

      {/* Main Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 rounded-3xl bg-gray-900/50 border border-white/5 backdrop-blur-xl hover:border-[#a3e635]/30 transition-all group">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#a3e635]/20 flex items-center justify-center text-[#a3e635]">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2v20M2 12h20" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">
                Goal Focus
              </p>
              <p className="text-xl font-bold text-white">
                {data.fitnessGoal.replace(/([A-Z])/g, ' $1').trim()}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-gray-900/50 border border-white/5 backdrop-blur-xl hover:border-[#a3e635]/30 transition-all group">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center text-orange-500">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">
                Weekly Calorie Target
              </p>
              <p className="text-xl font-bold text-white">
                {targets.weeklyCalorieBurnTarget.toLocaleString()} kcal
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Editable Plan Section */}
      <div className="p-8 rounded-[2rem] bg-gradient-to-b from-gray-900/80 to-black border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 flex items-center gap-6">
          <button
            onClick={handleReset}
            className="text-sm font-medium text-gray-400 hover:text-white transition-colors flex items-center gap-2"
          >
            Reset
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M3 21v-5h5" />
            </svg>
          </button>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-sm font-medium text-[#a3e635] hover:text-[#bef264] transition-colors flex items-center gap-2"
          >
            {isEditing ? 'Save Changes' : 'Edit Plan'}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        </div>

        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
          Weekly Commitment
          <div className="h-px flex-1 bg-white/5" />
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Total Workout Minutes</label>
            {isEditing ? (
              <input
                type="number"
                value={targets.weeklyWorkoutMinutes}
                onChange={e => handleUpdateDirect('weeklyWorkoutMinutes', Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#a3e635] transition-all"
              />
            ) : (
              <p className="text-3xl font-black text-white">
                {targets.weeklyWorkoutMinutes}{' '}
                <span className="text-lg font-normal text-gray-500">min/week</span>
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Target Sessions</label>
            {isEditing ? (
              <input
                type="number"
                value={targets.weeklyWorkoutFrequencyTarget}
                onChange={e =>
                  handleUpdateDirect('weeklyWorkoutFrequencyTarget', Number(e.target.value))
                }
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#a3e635] transition-all"
              />
            ) : (
              <p className="text-3xl font-black text-white">
                {targets.weeklyWorkoutFrequencyTarget}{' '}
                <span className="text-lg font-normal text-gray-500">sessions</span>
              </p>
            )}
          </div>
        </div>

        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
          Activity Breakdown
          <div className="h-px flex-1 bg-white/5" />
        </h3>

        <div className="space-y-4">
          {targets.workoutTypeDistribution.map((dist, idx) => (
            <div
              key={dist.workoutType}
              className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-wrap items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white font-bold uppercase text-xs">
                  {dist.workoutType.substring(0, 2)}
                </div>
                <div>
                  <p className="text-white font-bold capitalize">{dist.workoutType}</p>
                  <p className="text-xs text-gray-500">
                    {Math.round((dist.weeklyMinutes / targets.weeklyWorkoutMinutes) * 100)}% of
                    focus
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Duration</p>
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={dist.weeklyMinutes}
                        onChange={e =>
                          handleUpdateDistribution(idx, 'weeklyMinutes', Number(e.target.value))
                        }
                        className="w-20 bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-white text-sm"
                      />
                      <span className="text-xs text-gray-500">min</span>
                    </div>
                  ) : (
                    <p className="text-white font-bold">{dist.weeklyMinutes} min</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Sessions</p>
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={dist.weeklySessions}
                        onChange={e =>
                          handleUpdateDistribution(idx, 'weeklySessions', Number(e.target.value))
                        }
                        className="w-16 bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-white text-sm"
                      />
                    </div>
                  ) : (
                    <p className="text-white font-bold">{dist.weeklySessions}x</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4">
        <motion.button
          onClick={onBack}
          className="px-8 py-4 rounded-2xl font-semibold text-lg border-2 border-white/10 text-white hover:bg-white/5 transition-all"
          whileTap={{ scale: 0.98 }}
        >
          Back
        </motion.button>
        <motion.button
          onClick={() => onComplete(targets, hasChanges)}
          className="flex-1 px-8 py-4 rounded-2xl font-bold text-lg bg-[#a3e635] text-gray-900 hover:bg-[#bef264] shadow-[0_0_20px_rgba(163,230,53,0.3)] transition-all flex items-center justify-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Set Schedule
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
        </motion.button>
      </div>
    </motion.div>
  )
}
