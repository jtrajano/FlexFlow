import React, { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { motion, AnimatePresence } from 'framer-motion'
import { Step1Profile } from './Step1Profile'
import { Step2FitnessGoal } from './Step2FitnessGoal'
import { Step3ActivityLevel } from './Step3ActivityLevel'
import { Step4WorkoutPreferences } from './Step4WorkoutPreferences'

import { OnboardingData } from '@repo/shared'

interface OnboardingProps {
  onComplete: (data: OnboardingData) => void
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [data, setData] = useState<OnboardingData>({
    name: user?.displayName || '',
    birthdate: '2000-01-01',
    gender: '',
    weight: '',
    height: '',
    fitnessGoal: '',
    activityLevel: '',
    workoutPreferences: [],
  })

  const totalSteps = 4
  const progress = (currentStep / totalSteps) * 100

  const handleNext = (stepData: Partial<OnboardingData>) => {
    const updatedData = { ...data, ...stepData }
    setData(updatedData)

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete(updatedData)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-lg font-bold text-[#a3e635]">{progress.toFixed(0)}%</span>
          </div>
          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#a3e635]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pt-24 pb-12 px-6">
        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            {currentStep === 1 && <Step1Profile key="step1" data={data} onNext={handleNext} />}
            {currentStep === 2 && (
              <Step2FitnessGoal key="step2" data={data} onNext={handleNext} onBack={handleBack} />
            )}
            {currentStep === 3 && (
              <Step3ActivityLevel key="step3" data={data} onNext={handleNext} onBack={handleBack} />
            )}
            {currentStep === 4 && (
              <Step4WorkoutPreferences
                key="step4"
                data={data}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
