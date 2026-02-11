/**
 * =============================================================================
 * WELCOME TO THE HYTEL WAY: MONOREPO STACK
 * =============================================================================
 *
 * This file demonstrates the key concepts of our tech stack using friendly
 * analogies. Think of building a web app like putting on a theater production!
 *
 * THE STACK EXPLAINED (Theater Analogy):
 *
 * PNPM (Package Manager)
 *    -> "The super-organized prop master"
 *    -> Manages all the tools/packages we need, storing them efficiently
 *    -> Unlike npm, it doesn't duplicate packages - saves space!
 *
 * TURBOREPO (Monorepo Build System)
 *    -> "The stage manager who coordinates everything"
 *    -> Runs tasks (build, test, dev) across multiple packages smartly
 *    -> Caches results so repeated tasks are lightning fast!
 *
 * REACT + VITE (Frontend Framework + Build Tool)
 *    -> "The stage and lighting system"
 *    -> React: Builds the interactive UI (the actors on stage)
 *    -> Vite: Super-fast dev server (instant lighting changes!)
 *
 * TAILWIND CSS + SHADCN UI (Styling)
 *    -> "The costume designer"
 *    -> Tailwind: Utility classes for quick styling (fabric swatches)
 *    -> Shadcn UI: Pre-made, beautiful component patterns (costume templates)
 *
 * @repo/ui (Shared Component Package)
 *    -> "The shared costume closet"
 *    -> Components here (Header, Button, Card) can be used by ANY app!
 *    -> Located in: packages/ui/
 *
 * @repo/shared (Shared Types & Schemas)
 *    -> "The spellbook of shared rules"
 *    -> Zod schemas define what data looks like (validation spells!)
 *    -> Located in: packages/shared/
 *
 * tRPC + TanStack Query (API Layer)
 *    -> "The messenger system between actors"
 *    -> tRPC: Type-safe communication with backend (no lost messages!)
 *    -> TanStack Query: Smart caching of server data (remembers the script!)
 *
 * =============================================================================
 */

import { useState } from 'react'
import './style.css'

import { doc, setDoc, updateDoc, collection } from 'firebase/firestore'
import { db } from './lib/firebase'
import { OnboardingData, calculateTargets } from '@repo/shared'

import { useAuth } from './hooks/useAuth'
import { LoginView } from './components/auth/LoginView'
import { Dashboard } from './components/dashboard/Dashboard'
import { Onboarding } from './components/onboarding/Onboarding'
import { OnboardingSuccessView } from './components/onboarding/OnboardingSuccessView'

/**
 * Main App Component
 *
 * This is the "main stage" of our application. Everything you see
 * in the browser starts here!
 */
export function App() {
  const { user, userData, loading } = useAuth()
  const [showSuccess, setShowSuccess] = useState(false)
  const [onboardedName, setOnboardedName] = useState('')

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return <LoginView />
  }

  const handleOnboardingComplete = async (data: OnboardingData) => {
    if (!user) return

    try {
      // 1. Update User document
      const userRef = doc(db, 'users', user.uid)
      const currentDate = new Date().toISOString()
      await updateDoc(userRef, {
        onBoardingCompleted: true,
        displayName: data.name,
      })

      // Calculate automated fitness targets
      const targets = calculateTargets(data)

      // 2. Create UserProfile
      const profileRef = doc(db, 'userProfiles', user.uid)
      await setDoc(profileRef, {
        userId: user.uid,
        name: data.name,
        gender: data.gender,
        height: parseFloat(data.height) || null,
        birthdate: data.birthdate,
        createdAt: currentDate,
        updatedAt: currentDate,
      })

      // 3. Create initial BodyMetrics entry
      const metricsRef = doc(collection(db, 'bodyMetrics'))
      await setDoc(metricsRef, {
        uid: metricsRef.id,
        userId: user.uid,
        weight: parseFloat(data.weight) || 0,
        bodyFatPercent: null,
        recordedAt: currentDate,
      })

      // 4. Create UserGoals
      const goalsRef = doc(collection(db, 'userGoals'))
      await setDoc(goalsRef, {
        uid: goalsRef.id,
        userId: user.uid,
        goalType: data.fitnessGoal,
        activityLevel: data.activityLevel,
        workoutPreferences: data.workoutPreferences.join(','),
        weeklyCalorieBurnTarget: targets.weeklyCalorieBurnTarget,
        weeklyWorkoutMinutes: targets.weeklyWorkoutMinutes,
        weeklyWorkoutFrequencyTarget: targets.weeklyWorkoutFrequencyTarget,
        dailyMoveTarget: targets.dailyMoveTarget,
        dailyExerciseTarget: targets.dailyExerciseTarget,
        createdAt: currentDate,
      })

      setOnboardedName(data.name)
      setShowSuccess(true)
    } catch (error) {
      console.error('Error completing onboarding:', error)
      alert('Failed to save your profile. Please try again.')
    }
  }

  if (showSuccess) {
    return <OnboardingSuccessView name={onboardedName} onDone={() => window.location.reload()} />
  }

  if (userData && !userData.onBoardingCompleted) {
    return <Onboarding onComplete={handleOnboardingComplete} />
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Dashboard />
    </div>
  )
}
