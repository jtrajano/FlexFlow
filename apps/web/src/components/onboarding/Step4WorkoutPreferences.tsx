import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { OnboardingData } from '@repo/shared'

interface Step4WorkoutPreferencesProps {
  data: OnboardingData
  onNext: (data: Partial<OnboardingData>) => void
  onBack: () => void
}

const workoutTypes = [
  {
    id: 'strength',
    title: 'Strength Training',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M6.5 6.5l11 11M21 21l-1-1M3 3l1 1M18 22l4-4M2 6l4-4M3 10l7-7M14 21l7-7" />
      </svg>
    ),
  },
  {
    id: 'cardio',
    title: 'Cardio',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
  {
    id: 'yoga',
    title: 'Yoga',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="5" r="3" />
        <path d="M12 8v13M8 14l4-4 4 4M8 20h8" />
      </svg>
    ),
  },
  {
    id: 'hiit',
    title: 'HIIT',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
  {
    id: 'pilates',
    title: 'Pilates',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2v20M2 12h20" />
      </svg>
    ),
  },
  {
    id: 'sports',
    title: 'Sports',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20" />
      </svg>
    ),
  },
  {
    id: 'crossfit',
    title: 'CrossFit',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M4 15l4-4 4 4 8-8M20 9v6M4 15v6" />
      </svg>
    ),
  },
  {
    id: 'swimming',
    title: 'Swimming',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M2 15s1.5-2 4-2 4 2 6 2 4-2 6-2 4 2 4 2M2 20s1.5-2 4-2 4 2 6 2 4-2 6-2 4 2 4 2M12 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
      </svg>
    ),
  },
]

export function Step4WorkoutPreferences({ data, onNext, onBack }: Step4WorkoutPreferencesProps) {
  const [selected, setSelected] = useState<string[]>(data.workoutPreferences)

  const toggleSelection = (id: string) => {
    setSelected(prev => (prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]))
  }

  const handleContinue = () => {
    if (selected.length > 0) {
      onNext({ workoutPreferences: selected })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Icon */}
      <div className="mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#a3e635]/20 to-[#84cc16]/10 border border-[#a3e635]/30 flex items-center justify-center">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#a3e635"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        </div>
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold text-white mb-3">Workout preferences</h1>
      <p className="text-gray-400 mb-8">
        Select all the workout types you're interested in. Choose at least one.
      </p>

      {/* Workout Type Grid */}
      <div className="grid grid-cols-2 gap-3 mb-12">
        {workoutTypes.map(workout => {
          const isSelected = selected.includes(workout.id)
          return (
            <motion.button
              key={workout.id}
              onClick={() => toggleSelection(workout.id)}
              className={`p-4 rounded-xl border-2 transition-all ${
                isSelected
                  ? 'border-[#a3e635] bg-[#a3e635]/10'
                  : 'border-gray-800 bg-gray-900/30 hover:border-gray-700'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isSelected ? 'bg-[#a3e635] text-gray-900' : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  {workout.icon}
                </div>
                <span className="text-sm font-medium text-white">{workout.title}</span>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-[#a3e635] flex items-center justify-center">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#000"
                      strokeWidth="3"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                )}
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Selected Count */}
      {selected.length > 0 && (
        <div className="mb-6 text-center">
          <p className="text-sm text-gray-400">
            {selected.length} {selected.length === 1 ? 'preference' : 'preferences'} selected
          </p>
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-4">
        <motion.button
          onClick={onBack}
          className="px-6 py-4 rounded-2xl font-semibold text-lg border-2 border-gray-800 text-white hover:border-gray-700 transition-all"
          whileTap={{ scale: 0.98 }}
        >
          Back
        </motion.button>
        <motion.button
          onClick={handleContinue}
          disabled={selected.length === 0}
          className={`flex-1 px-6 py-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-2 transition-all ${
            selected.length > 0
              ? 'bg-[#a3e635] text-gray-900 hover:bg-[#84cc16]'
              : 'bg-gray-800 text-gray-600 cursor-not-allowed'
          }`}
          whileTap={selected.length > 0 ? { scale: 0.98 } : {}}
        >
          Complete
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </motion.button>
      </div>
    </motion.div>
  )
}
