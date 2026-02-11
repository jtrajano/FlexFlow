import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { OnboardingData } from './Onboarding'

interface Step1ProfileProps {
  data: OnboardingData
  onNext: (data: Partial<OnboardingData>) => void
}

export function Step1Profile({ data, onNext }: Step1ProfileProps) {
  const [name, setName] = useState(data.name)
  const [birthdate, setBirthdate] = useState(data.birthdate)
  const [gender, setGender] = useState(data.gender)
  const [weight, setWeight] = useState(data.weight)
  const [height, setHeight] = useState(data.height)

  const handleContinue = () => {
    if (name && birthdate && gender && weight && height) {
      onNext({ name, birthdate, gender, weight, height })
    }
  }

  const isValid = name && birthdate && gender && weight && height

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
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold text-white mb-3">Let's get to know you</h1>
      <p className="text-gray-400 mb-8">
        Tell us a bit about yourself to personalize your experience.
      </p>

      {/* Form */}
      <div className="space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Your Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Enter your name"
            className="w-full px-4 py-4 bg-gray-900/50 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#a3e635] focus:ring-1 focus:ring-[#a3e635] transition-all"
          />
        </div>

        {/* Birthdate and Gender */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Birth Date</label>
            <input
              type="date"
              value={birthdate}
              onChange={e => setBirthdate(e.target.value)}
              className="w-full px-4 py-4 bg-gray-900/50 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#a3e635] focus:ring-1 focus:ring-[#a3e635] transition-all [color-scheme:dark]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Gender</label>
            <select
              value={gender}
              onChange={e => setGender(e.target.value)}
              className="w-full px-4 py-4 bg-gray-900/50 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#a3e635] focus:ring-1 focus:ring-[#a3e635] transition-all appearance-none"
            >
              <option value="" disabled className="bg-gray-900">
                Select Gender
              </option>
              <option value="male" className="bg-gray-900">
                Male
              </option>
              <option value="female" className="bg-gray-900">
                Female
              </option>
              <option value="other" className="bg-gray-900">
                Other
              </option>
              <option value="prefer-not-to-say" className="bg-gray-900">
                Prefer not to say
              </option>
            </select>
          </div>
        </div>

        {/* Weight and Height */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Weight (kg)</label>
            <input
              type="number"
              value={weight}
              onChange={e => setWeight(e.target.value)}
              placeholder="70"
              className="w-full px-4 py-4 bg-gray-900/50 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#a3e635] focus:ring-1 focus:ring-[#a3e635] transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Height (cm)</label>
            <input
              type="number"
              value={height}
              onChange={e => setHeight(e.target.value)}
              placeholder="170"
              className="w-full px-4 py-4 bg-gray-900/50 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#a3e635] focus:ring-1 focus:ring-[#a3e635] transition-all"
            />
          </div>
        </div>
      </div>

      {/* Continue Button */}
      <motion.button
        onClick={handleContinue}
        disabled={!isValid}
        className={`w-full mt-12 px-6 py-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-2 transition-all ${
          isValid
            ? 'bg-[#a3e635] text-gray-900 hover:bg-[#84cc16] hover:scale-[1.02] active:scale-[0.98]'
            : 'bg-gray-800 text-gray-600 cursor-not-allowed'
        }`}
        whileTap={isValid ? { scale: 0.98 } : {}}
      >
        Continue
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </motion.button>
    </motion.div>
  )
}
