import { calculateActivityCalories } from './fitness-calculations'

export interface WorkoutTemplate {
  id: string
  title: string
  description: string
  type: string
  duration: number
  bgGradient: string
  intensity: 'low' | 'moderate' | 'high'
}

export const WORKOUT_TEMPLATES: WorkoutTemplate[] = [
  {
    id: 'up-power',
    title: 'Upper Body Power',
    description: 'Chest, shoulders & arms with heavy resistance',
    type: 'strength',
    duration: 45,
    bgGradient: 'bg-gradient-to-br from-green-900 to-green-950',
    intensity: 'high',
  },
  {
    id: 'low-strength',
    title: 'Leg Day Essentials',
    description: 'Squats, lunges and glute focus',
    type: 'strength',
    duration: 50,
    bgGradient: 'bg-gradient-to-br from-emerald-900 to-emerald-950',
    intensity: 'high',
  },
  {
    id: 'hiit-max',
    title: 'HIIT Cardio Blast',
    description: 'High intensity intervals for maximum burn',
    type: 'hiit',
    duration: 30,
    bgGradient: 'bg-gradient-to-br from-gray-800 to-gray-900',
    intensity: 'high',
  },
  {
    id: 'yoga-flow',
    title: 'Zen Yoga Flow',
    description: 'Flexibility and balance for recovery',
    type: 'yoga',
    duration: 40,
    bgGradient: 'bg-gradient-to-br from-blue-900 to-blue-950',
    intensity: 'low',
  },
  {
    id: 'core-stable',
    title: 'Core Stability',
    description: 'Deep abs and back strengthening',
    type: 'pilates',
    duration: 35,
    bgGradient: 'bg-gradient-to-br from-indigo-900 to-indigo-950',
    intensity: 'moderate',
  },
  {
    id: 'swim-endurance',
    title: 'Endurance Swim',
    description: 'Continuous laps for cardiovascular health',
    type: 'swimming',
    duration: 45,
    bgGradient: 'bg-gradient-to-br from-cyan-900 to-cyan-950',
    intensity: 'moderate',
  },
  {
    id: 'brisk-walk',
    title: 'Brisk Nature Walk',
    description: 'Active recovery in the fresh air',
    type: 'walking',
    duration: 60,
    bgGradient: 'bg-gradient-to-br from-orange-900 to-orange-950',
    intensity: 'low',
  },
  {
    id: 'cross-total',
    title: 'Total CrossFit',
    description: 'Functional movements at high intensity',
    type: 'crossfit',
    duration: 45,
    bgGradient: 'bg-gradient-to-br from-red-900 to-red-950',
    intensity: 'high',
  },
  {
    id: 'med-deep',
    title: 'Mindful Meditation',
    description: 'Find your center with guided mindfulness',
    type: 'meditation',
    duration: 15,
    bgGradient: 'bg-gradient-to-br from-purple-900 to-purple-950',
    intensity: 'low',
  },
  {
    id: 'breath-work',
    title: 'Deep Breathing',
    description: 'Box breathing techniques for stress relief',
    type: 'breathing',
    duration: 10,
    bgGradient: 'bg-gradient-to-br from-teal-900 to-teal-950',
    intensity: 'low',
  },
  {
    id: 'relax-muscle',
    title: 'Progressive Relaxation',
    description: 'Release tension from every muscle group',
    type: 'meditation',
    duration: 20,
    bgGradient: 'bg-gradient-to-br from-indigo-900 to-indigo-950',
    intensity: 'low',
  },
]

export function getRecommendedWorkouts(
  userPreferences: string[],
  weightKg: number = 70,
  limit: number = 3,
  isRestDay: boolean = false
) {
  // If it's a rest day, prioritize active recovery and mental wellness
  const recoveryTypes = ['meditation', 'breathing', 'yoga', 'walking', 'pilates', 'swimming']

  let library = WORKOUT_TEMPLATES

  if (isRestDay) {
    // Filter for low intensity/recovery workouts
    const recoveryMatches = library.filter(t => recoveryTypes.includes(t.type))

    // On rest days, we prioritize mental wellness (meditation/breathing)
    const mentalWellness = recoveryMatches.filter(t => ['meditation', 'breathing'].includes(t.type))
    const physicalRecovery = recoveryMatches.filter(
      t => !['meditation', 'breathing'].includes(t.type)
    )

    // Take a mix: at least 2 mental wellness if available, then fill with physical recovery
    const results: WorkoutTemplate[] = [...mentalWellness.slice(0, 2), ...physicalRecovery]

    library = results
  } else {
    // Normal day: filter based on user's preferred workout types
    const preferredMatches = library.filter(t => userPreferences.includes(t.type))
    if (preferredMatches.length > 0) {
      library = preferredMatches
    }
  }

  // If we still have more than limit, slice. If empty, fallback to all.
  const results = library.length > 0 ? library : WORKOUT_TEMPLATES

  // Map to dashboard-friendly format with calculated calories
  return results.slice(0, limit).map(t => ({
    ...t,
    calories: calculateActivityCalories(t.type, t.duration, weightKg),
  }))
}
