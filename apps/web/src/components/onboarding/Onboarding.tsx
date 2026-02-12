import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import { signOut } from 'firebase/auth'
import { auth } from '../../lib/firebase'
import { Step1Profile } from './Step1Profile'
import { Step2FitnessGoal } from './Step2FitnessGoal'
import { Step3ActivityLevel } from './Step3ActivityLevel'
import { Step4WorkoutPreferences } from './Step4WorkoutPreferences'
import { RecommendationView } from './RecommendationView'
import { OnboardingData, FitnessTargets, calculateTargets } from '@repo/shared'

interface OnboardingProps {
  onComplete: (data: OnboardingData, targets?: FitnessTargets, hasChanges?: boolean) => void
  onSaveGoals: (data: OnboardingData, targets: FitnessTargets) => Promise<void>
}

export function Onboarding({ onComplete, onSaveGoals }: OnboardingProps) {
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

  const totalSteps = 5
  const progress = (currentStep / totalSteps) * 100

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      window.location.reload()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleNext = (stepData: Partial<OnboardingData>) => {
    const updatedData = { ...data, ...stepData }
    setData(updatedData)

    if (currentStep < totalSteps) {
      // If we are moving from Step 4 (Preferences) to Step 5 (Recommendation),
      // save the automated computation record.
      if (currentStep === 4) {
        const targets = calculateTargets(updatedData)
        onSaveGoals(updatedData, targets).catch(err =>
          console.error('Error saving initial goals:', err)
        )
      }
      setCurrentStep(currentStep + 1)
    }
  }

  const handleRecommendationComplete = (targets: FitnessTargets, hasChanges: boolean) => {
    onComplete(data, targets, hasChanges)
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gray-900/50 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Step {currentStep} of {totalSteps}
              </span>
              <div className="h-4 w-px bg-white/10" />
              <button
                onClick={handleSignOut}
                className="text-xs font-medium text-red-400/80 hover:text-red-400 transition-colors uppercase tracking-wider"
              >
                Sign Out
              </button>
            </div>
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
            {currentStep === 5 && (
              <RecommendationView
                key="step5"
                data={data}
                onComplete={handleRecommendationComplete}
                onBack={handleBack}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
