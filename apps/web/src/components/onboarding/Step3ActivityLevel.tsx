import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { OnboardingData } from '@repo/shared'

interface Step3ActivityLevelProps {
  data: OnboardingData
  onNext: (data: Partial<OnboardingData>) => void
  onBack: () => void
}

const activityLevels = [
  {
    id: 'sedentary',
    title: 'Sedentary',
    description: 'Little to no exercise',
    detail: 'Desk job, minimal activity',
  },
  {
    id: 'lightly_active',
    title: 'Lightly Active',
    description: 'Light exercise 1-3 days/week',
    detail: 'Occasional walks or light workouts',
  },
  {
    id: 'moderately_active',
    title: 'Moderately Active',
    description: 'Moderate exercise 3-5 days/week',
    detail: 'Regular gym sessions or sports',
  },
  {
    id: 'very_active',
    title: 'Very Active',
    description: 'Hard exercise 6-7 days/week',
    detail: 'Daily intense training',
  },
  {
    id: 'extremely_active',
    title: 'Extremely Active',
    description: 'Very hard exercise & physical job',
    detail: 'Athlete or physical labor',
  },
]

export function Step3ActivityLevel({ data, onNext, onBack }: Step3ActivityLevelProps) {
  const [selected, setSelected] = useState(data.activityLevel)

  const handleContinue = () => {
    if (selected) {
      onNext({ activityLevel: selected })
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
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </div>
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold text-white mb-3">What's your activity level?</h1>
      <p className="text-gray-400 mb-8">This helps us understand your current fitness routine.</p>

      {/* Activity Level Options */}
      <div className="space-y-3 mb-12">
        {activityLevels.map(level => (
          <motion.button
            key={level.id}
            onClick={() => setSelected(level.id)}
            className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
              selected === level.id
                ? 'border-[#a3e635] bg-[#a3e635]/10'
                : 'border-gray-800 bg-gray-900/30 hover:border-gray-700'
            }`}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-base font-semibold text-white mb-0.5">{level.title}</h3>
                <p className="text-sm text-gray-400">{level.description}</p>
                <p className="text-xs text-gray-500 mt-1">{level.detail}</p>
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ml-3 ${
                  selected === level.id ? 'border-[#a3e635] bg-[#a3e635]' : 'border-gray-600'
                }`}
              >
                {selected === level.id && (
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
                )}
              </div>
            </div>
          </motion.button>
        ))}
      </div>

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
          disabled={!selected}
          className={`flex-1 px-6 py-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-2 transition-all ${
            selected
              ? 'bg-[#a3e635] text-gray-900 hover:bg-[#84cc16]'
              : 'bg-gray-800 text-gray-600 cursor-not-allowed'
          }`}
          whileTap={selected ? { scale: 0.98 } : {}}
        >
          Continue
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </motion.button>
      </div>
    </motion.div>
  )
}
