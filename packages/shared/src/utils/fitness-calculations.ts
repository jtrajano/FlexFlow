import { OnboardingData } from '../types/onboarding'

export interface FitnessTargets {
  weeklyCalorieBurnTarget: number
  weeklyWorkoutMinutes: number
  weeklyWorkoutFrequencyTarget: number
  dailyMoveTarget: number
  dailyExerciseTarget: number
}

/**
 * Calculates fitness targets based on onboarding data using simplified
 * health science formulas (Harris-Benedict / Mifflin-St Jeor).
 */
export function calculateTargets(data: OnboardingData): FitnessTargets {
  const weight = parseFloat(data.weight) || 70
  const height = parseFloat(data.height) || 170

  // Calculate Age
  const birthDate = new Date(data.birthdate)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const m = today.getMonth() - birthDate.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  if (isNaN(age)) age = 25 // Fallback

  // 1. Calculate BMR (Mifflin-St Jeor Equation)
  let bmr = 10 * weight + 6.25 * height - 5 * age
  if (data.gender === 'male') {
    bmr += 5
  } else {
    bmr -= 161
  }

  // 2. TDEE Multipliers
  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extremely_active: 1.9,
  }
  const multiplier = activityMultipliers[data.activityLevel] || 1.2
  const tdee = bmr * multiplier

  // 3. Goal Adjustment (Daily)
  let dailyCalorieGoal = tdee
  if (data.fitnessGoal === 'LoseWeight') {
    dailyCalorieGoal -= 500
  } else if (data.fitnessGoal === 'BuildMuscle') {
    dailyCalorieGoal += 300
  }

  // 4. Workout Frequency and Duration
  const frequencyMap: Record<string, number> = {
    sedentary: 2,
    lightly_active: 3,
    moderately_active: 4,
    very_active: 5,
    extremely_active: 6,
  }

  const weeklyWorkoutFrequencyTarget = frequencyMap[data.activityLevel] || 3
  const weeklyWorkoutMinutes = weeklyWorkoutFrequencyTarget * 45 // Default 45 mins per session

  const weeklyCalorieBurnTarget = Math.round(dailyCalorieGoal * 7)
  const dailyMoveTarget = Math.round(dailyCalorieGoal)
  const dailyExerciseTarget = Math.round(weeklyWorkoutMinutes / 7)

  return {
    weeklyCalorieBurnTarget,
    weeklyWorkoutMinutes,
    weeklyWorkoutFrequencyTarget,
    dailyMoveTarget,
    dailyExerciseTarget,
  }
}
