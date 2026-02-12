import { OnboardingData } from '../types/onboarding'

export interface WorkoutTypeDistribution {
  workoutType: string
  weeklyMinutes: number
  weeklySessions: number
}

export interface FitnessTargets {
  weeklyCalorieBurnTarget: number
  weeklyWorkoutMinutes: number
  weeklyWorkoutFrequencyTarget: number
  dailyMoveTarget: number
  dailyExerciseTarget: number
  workoutTypeDistribution: WorkoutTypeDistribution[]
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

  // 5. Workout Type Distribution
  const workoutTypeDistribution: WorkoutTypeDistribution[] = []
  const prefs =
    data.workoutPreferences && data.workoutPreferences.length > 0
      ? data.workoutPreferences
      : ['strength', 'cardio']

  // Weighting mapping for different fitness goals
  const weights: Record<string, Record<string, number>> = {
    BuildMuscle: { strength: 4, hiit: 1, cardio: 1, crossfit: 3 },
    LoseWeight: { cardio: 4, hiit: 4, strength: 2, swimming: 3 },
    StayFit: { strength: 2, cardio: 2, yoga: 2, walking: 3 },
    ImproveEndurance: { cardio: 5, swimming: 4, hiit: 2, walking: 2 },
  }

  const goalWeights = weights[data.fitnessGoal] || { strength: 1, cardio: 1 }

  // Calculate total weight of selected preferences
  let totalPreferenceWeight = 0
  prefs.forEach(pref => {
    totalPreferenceWeight += goalWeights[pref] || 1
  })

  let remainingSessions = weeklyWorkoutFrequencyTarget
  let remainingMinutes = weeklyWorkoutMinutes

  prefs.forEach((pref, index) => {
    let sessions: number
    let minutes: number

    // For the last preference, use all remaining sessions/minutes to avoid rounding issues
    if (index === prefs.length - 1) {
      sessions = remainingSessions
      minutes = remainingMinutes
    } else {
      const weight = goalWeights[pref] || 1
      sessions = Math.round((weight / totalPreferenceWeight) * weeklyWorkoutFrequencyTarget)
      sessions = Math.min(sessions, remainingSessions)

      minutes = Math.round((weight / totalPreferenceWeight) * weeklyWorkoutMinutes)
      minutes = Math.min(minutes, remainingMinutes)

      remainingSessions -= sessions
      remainingMinutes -= minutes
    }

    if (sessions > 0) {
      workoutTypeDistribution.push({
        workoutType: pref,
        weeklyMinutes: minutes,
        weeklySessions: sessions,
      })
    }
  })

  return {
    weeklyCalorieBurnTarget,
    weeklyWorkoutMinutes,
    weeklyWorkoutFrequencyTarget,
    dailyMoveTarget,
    dailyExerciseTarget,
    workoutTypeDistribution,
  }
}

/**
 * MET (Metabolic Equivalent of Task) values for common activities
 */
export const MET_VALUES: Record<string, number> = {
  strength: 6.0,
  cardio: 8.0,
  yoga: 3.0,
  hiit: 11.0,
  pilates: 3.5,
  sports: 7.0,
  crossfit: 10.0,
  swimming: 8.0,
  walking: 3.5,
}

/**
 * Calculates calories burned for an activity based on MET, weight, and duration.
 * Formula: Calories = MET * weight (kg) * duration (hours)
 */
export function calculateActivityCalories(
  type: string,
  durationMinutes: number,
  weightKg: number
): number {
  const met = MET_VALUES[type] || 3.5 // Fallback to walking MET
  const durationHours = durationMinutes / 60
  return Math.round(met * weightKg * durationHours)
}
