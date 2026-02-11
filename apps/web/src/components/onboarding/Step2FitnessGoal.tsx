import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { OnboardingData } from './Onboarding'

interface Step2FitnessGoalProps {
  data: OnboardingData
  onNext: (data: Partial<OnboardingData>) => void
  onBack: () => void
}

const goals = [
  {
    id: 'lose_weight',
    title: 'Lose Weight',
    description: 'Burn fat and get leaner',
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    id: 'build_muscle',
    title: 'Build Muscle',
    description: 'Gain strength and size',
    icon: (
      <svg
        width="24"
        height="24"
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
    id: 'stay_fit',
    title: 'Stay Fit',
    description: 'Maintain current fitness',
    icon: (
      <svg
        width="24"
        height="24"
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
    id: 'improve_endurance',
    title: 'Improve Endurance',
    description: 'Boost stamina and cardio',
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
]

export function Step2FitnessGoal({ data, onNext, onBack }: Step2FitnessGoalProps) {
  const [selected, setSelected] = useState(data.fitnessGoal)

  const handleContinue = () => {
    if (selected) {
      onNext({ fitnessGoal: selected })
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
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        </div>
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold text-white mb-3">What's your fitness goal?</h1>
      <p className="text-gray-400 mb-8">
        Choose the goal that best describes what you want to achieve.
      </p>

      {/* Goal Options */}
      <div className="space-y-4 mb-12">
        {goals.map(goal => (
          <motion.button
            key={goal.id}
            onClick={() => setSelected(goal.id)}
            className={`w-full p-5 rounded-2xl border-2 transition-all text-left ${
              selected === goal.id
                ? 'border-[#a3e635] bg-[#a3e635]/10'
                : 'border-gray-800 bg-gray-900/30 hover:border-gray-700'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  selected === goal.id ? 'bg-[#a3e635] text-gray-900' : 'bg-gray-800 text-gray-400'
                }`}
              >
                {goal.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">{goal.title}</h3>
                <p className="text-sm text-gray-400">{goal.description}</p>
              </div>
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selected === goal.id ? 'border-[#a3e635] bg-[#a3e635]' : 'border-gray-600'
                }`}
              >
                {selected === goal.id && (
                  <svg
                    width="14"
                    height="14"
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
