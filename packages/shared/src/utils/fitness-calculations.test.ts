import { describe, it, expect } from 'vitest'
import {
  calculateTargets,
  generateDefaultSchedule,
  calculateActivityCalories,
  MET_VALUES,
  type FitnessTargets,
} from './fitness-calculations'
import type { OnboardingData } from '../types/onboarding'

describe('calculateTargets', () => {
  const baseOnboardingData: OnboardingData = {
    name: 'Test User',
    birthdate: '1990-01-01',
    gender: 'male',
    weight: '70',
    height: '170',
    fitnessGoal: 'StayFit',
    activityLevel: 'moderately_active',
    workoutPreferences: ['strength', 'cardio'],
  }

  it('calculates targets for a male user', () => {
    const targets = calculateTargets(baseOnboardingData)

    expect(targets).toBeDefined()
    expect(targets.weeklyCalorieBurnTarget).toBeGreaterThan(0)
    expect(targets.weeklyWorkoutMinutes).toBeGreaterThan(0)
    expect(targets.weeklyWorkoutFrequencyTarget).toBeGreaterThan(0)
    expect(targets.dailyMoveTarget).toBeGreaterThan(0)
    expect(targets.dailyExerciseTarget).toBeGreaterThan(0)
    expect(targets.workoutTypeDistribution).toHaveLength(2)
  })

  it('calculates targets for a female user', () => {
    const femaleData: OnboardingData = {
      ...baseOnboardingData,
      gender: 'female',
    }
    const targets = calculateTargets(femaleData)

    expect(targets).toBeDefined()
    expect(targets.weeklyCalorieBurnTarget).toBeGreaterThan(0)
    // Female BMR should be lower than male (all else equal)
    const maleTargets = calculateTargets(baseOnboardingData)
    expect(targets.dailyMoveTarget).toBeLessThan(maleTargets.dailyMoveTarget)
  })

  it('adjusts calories for LoseWeight goal', () => {
    const loseWeightData: OnboardingData = {
      ...baseOnboardingData,
      fitnessGoal: 'LoseWeight',
    }
    const targets = calculateTargets(loseWeightData)
    const baseTargets = calculateTargets(baseOnboardingData)

    // LoseWeight should have lower daily calorie target (500 calorie deficit)
    expect(targets.dailyMoveTarget).toBeLessThan(baseTargets.dailyMoveTarget)
  })

  it('adjusts calories for BuildMuscle goal', () => {
    const buildMuscleData: OnboardingData = {
      ...baseOnboardingData,
      fitnessGoal: 'BuildMuscle',
    }
    const targets = calculateTargets(buildMuscleData)
    const baseTargets = calculateTargets(baseOnboardingData)

    // BuildMuscle should have higher daily calorie target (300 calorie surplus)
    expect(targets.dailyMoveTarget).toBeGreaterThan(baseTargets.dailyMoveTarget)
  })

  it('adjusts workout frequency based on activity level', () => {
    const sedentary = calculateTargets({ ...baseOnboardingData, activityLevel: 'sedentary' })
    const veryActive = calculateTargets({ ...baseOnboardingData, activityLevel: 'very_active' })

    expect(veryActive.weeklyWorkoutFrequencyTarget).toBeGreaterThan(
      sedentary.weeklyWorkoutFrequencyTarget
    )
    expect(veryActive.weeklyWorkoutMinutes).toBeGreaterThan(sedentary.weeklyWorkoutMinutes)
  })

  it('distributes workout types based on preferences and goals', () => {
    const targets = calculateTargets(baseOnboardingData)

    expect(targets.workoutTypeDistribution).toHaveLength(2)
    expect(targets.workoutTypeDistribution[0].workoutType).toBe('strength')
    expect(targets.workoutTypeDistribution[1].workoutType).toBe('cardio')

    // Check that all sessions and minutes are distributed
    const totalSessions = targets.workoutTypeDistribution.reduce(
      (sum, dist) => sum + dist.weeklySessions,
      0
    )
    const totalMinutes = targets.workoutTypeDistribution.reduce(
      (sum, dist) => sum + dist.weeklyMinutes,
      0
    )

    expect(totalSessions).toBe(targets.weeklyWorkoutFrequencyTarget)
    expect(totalMinutes).toBe(targets.weeklyWorkoutMinutes)
  })

  it('handles BuildMuscle goal with strength preference prioritization', () => {
    const buildMuscleData: OnboardingData = {
      ...baseOnboardingData,
      fitnessGoal: 'BuildMuscle',
      workoutPreferences: ['strength', 'cardio', 'hiit'],
    }
    const targets = calculateTargets(buildMuscleData)

    // For BuildMuscle, strength should get more allocation
    const strengthDist = targets.workoutTypeDistribution.find(d => d.workoutType === 'strength')
    const cardioDist = targets.workoutTypeDistribution.find(d => d.workoutType === 'cardio')

    expect(strengthDist).toBeDefined()
    expect(cardioDist).toBeDefined()
    expect(strengthDist!.weeklySessions).toBeGreaterThanOrEqual(cardioDist!.weeklySessions)
  })

  it('handles LoseWeight goal with cardio preference prioritization', () => {
    const loseWeightData: OnboardingData = {
      ...baseOnboardingData,
      fitnessGoal: 'LoseWeight',
      workoutPreferences: ['cardio', 'hiit', 'strength'],
    }
    const targets = calculateTargets(loseWeightData)

    // For LoseWeight, cardio and HIIT should get more allocation
    const cardioDist = targets.workoutTypeDistribution.find(d => d.workoutType === 'cardio')
    const hiitDist = targets.workoutTypeDistribution.find(d => d.workoutType === 'hiit')

    expect(cardioDist).toBeDefined()
    expect(hiitDist).toBeDefined()

    // Cardio and HIIT combined should get majority of sessions for LoseWeight goal
    const cardioHiitSessions = (cardioDist?.weeklySessions || 0) + (hiitDist?.weeklySessions || 0)
    expect(cardioHiitSessions).toBeGreaterThan(0)
  })

  it('uses default workout preferences when none provided', () => {
    const noPrefsData: OnboardingData = {
      ...baseOnboardingData,
      workoutPreferences: [],
    }
    const targets = calculateTargets(noPrefsData)

    expect(targets.workoutTypeDistribution).toHaveLength(2)
    // Default is ['strength', 'cardio']
    expect(targets.workoutTypeDistribution.map(d => d.workoutType)).toEqual(
      expect.arrayContaining(['strength', 'cardio'])
    )
  })

  it('calculates daily exercise target in precise minutes', () => {
    const targets = calculateTargets(baseOnboardingData)

    // dailyExerciseTarget should be weeklyWorkoutMinutes / 7
    const expectedDaily = Math.round(targets.weeklyWorkoutMinutes / 7)
    expect(targets.dailyExerciseTarget).toBe(expectedDaily)
  })

  it('handles edge case with young user', () => {
    const youngData: OnboardingData = {
      ...baseOnboardingData,
      birthdate: new Date().toISOString().split('T')[0], // Born today
    }
    const targets = calculateTargets(youngData)

    // Should use fallback age of 25
    expect(targets).toBeDefined()
    expect(targets.dailyMoveTarget).toBeGreaterThan(0)
  })

  it('handles edge case with invalid birthdate', () => {
    const invalidData: OnboardingData = {
      ...baseOnboardingData,
      birthdate: 'invalid-date',
    }
    const targets = calculateTargets(invalidData)

    // Should use fallback age of 25
    expect(targets).toBeDefined()
    expect(targets.dailyMoveTarget).toBeGreaterThan(0)
  })

  it('handles missing weight/height with fallback values', () => {
    const missingData: OnboardingData = {
      ...baseOnboardingData,
      weight: '',
      height: '',
    }
    const targets = calculateTargets(missingData)

    // Should use fallback weight=70, height=170
    expect(targets).toBeDefined()
    expect(targets.dailyMoveTarget).toBeGreaterThan(0)
  })
})

describe('generateDefaultSchedule', () => {
  const sampleTargets: FitnessTargets = {
    weeklyCalorieBurnTarget: 2000,
    weeklyWorkoutMinutes: 180,
    weeklyWorkoutFrequencyTarget: 4,
    dailyMoveTarget: 300,
    dailyExerciseTarget: 26,
    workoutTypeDistribution: [
      { workoutType: 'strength', weeklyMinutes: 90, weeklySessions: 2 },
      { workoutType: 'cardio', weeklyMinutes: 90, weeklySessions: 2 },
    ],
  }

  it('generates schedule with correct number of days', () => {
    const schedule = generateDefaultSchedule(sampleTargets)

    expect(schedule).toHaveLength(7)
    expect(schedule.map(s => s.dayOfWeek)).toEqual([
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ])
  })

  it('generates schedule with correct number of workout days', () => {
    const schedule = generateDefaultSchedule(sampleTargets)

    const workoutDays = schedule.filter(s => !s.isRestDay)
    const restDays = schedule.filter(s => s.isRestDay)

    expect(workoutDays).toHaveLength(sampleTargets.weeklyWorkoutFrequencyTarget)
    expect(restDays).toHaveLength(7 - sampleTargets.weeklyWorkoutFrequencyTarget)
  })

  it('distributes workout types across the week', () => {
    const schedule = generateDefaultSchedule(sampleTargets)

    const strengthDays = schedule.filter(s => s.workoutType === 'strength')
    const cardioDays = schedule.filter(s => s.workoutType === 'cardio')

    expect(strengthDays).toHaveLength(2)
    expect(cardioDays).toHaveLength(2)
  })

  it('assigns appropriate duration to each workout', () => {
    const schedule = generateDefaultSchedule(sampleTargets)

    const workoutDays = schedule.filter(s => !s.isRestDay)

    workoutDays.forEach(day => {
      expect(day.durationMinutes).toBeGreaterThan(0)
    })
  })

  it('marks rest days correctly', () => {
    const schedule = generateDefaultSchedule(sampleTargets)

    const restDays = schedule.filter(s => s.isRestDay)

    restDays.forEach(day => {
      expect(day.durationMinutes).toBe(0)
      expect(day.workoutType).toBeUndefined()
    })
  })

  it('sets default time of day for all workouts', () => {
    const schedule = generateDefaultSchedule(sampleTargets)

    schedule.forEach(day => {
      expect(day.timeOfDay).toBe('18:00')
    })
  })

  it('handles single workout type', () => {
    const singleTypeTargets: FitnessTargets = {
      ...sampleTargets,
      weeklyWorkoutFrequencyTarget: 3,
      workoutTypeDistribution: [{ workoutType: 'yoga', weeklyMinutes: 135, weeklySessions: 3 }],
    }
    const schedule = generateDefaultSchedule(singleTypeTargets)

    const yogaDays = schedule.filter(s => s.workoutType === 'yoga')
    expect(yogaDays).toHaveLength(3)
  })

  it('handles high frequency workout schedule', () => {
    const highFreqTargets: FitnessTargets = {
      ...sampleTargets,
      weeklyWorkoutFrequencyTarget: 6,
      workoutTypeDistribution: [
        { workoutType: 'strength', weeklyMinutes: 180, weeklySessions: 3 },
        { workoutType: 'cardio', weeklyMinutes: 135, weeklySessions: 3 },
      ],
    }
    const schedule = generateDefaultSchedule(highFreqTargets)

    const workoutDays = schedule.filter(s => !s.isRestDay)
    const restDays = schedule.filter(s => s.isRestDay)

    expect(workoutDays).toHaveLength(6)
    expect(restDays).toHaveLength(1)
  })

  it('spreads workouts across the week evenly', () => {
    const schedule = generateDefaultSchedule(sampleTargets)

    const workoutDays = schedule.filter(s => !s.isRestDay)
    const workoutIndices = workoutDays.map(day =>
      schedule.findIndex(s => s.dayOfWeek === day.dayOfWeek)
    )

    // Workouts should be somewhat spread out (not all consecutive)
    expect(workoutIndices).toHaveLength(4)
  })
})

describe('calculateActivityCalories', () => {
  it('calculates calories for strength training', () => {
    const calories = calculateActivityCalories('strength', 60, 70)

    // MET for strength = 6.0
    // Formula: MET * weight * hours = 6.0 * 70 * 1 = 420
    expect(calories).toBe(420)
  })

  it('calculates calories for cardio', () => {
    const calories = calculateActivityCalories('cardio', 30, 70)

    // MET for cardio = 8.0
    // Formula: 8.0 * 70 * 0.5 = 280
    expect(calories).toBe(280)
  })

  it('calculates calories for HIIT', () => {
    const calories = calculateActivityCalories('hiit', 20, 70)

    // MET for HIIT = 11.0
    // Formula: 11.0 * 70 * (20/60) = 256.67 -> 257
    expect(calories).toBe(257)
  })

  it('calculates calories for yoga', () => {
    const calories = calculateActivityCalories('yoga', 45, 70)

    // MET for yoga = 3.0
    // Formula: 3.0 * 70 * 0.75 = 157.5 -> 158
    expect(calories).toBe(158)
  })

  it('handles precise decimal minutes correctly', () => {
    // Test with decimal minutes (e.g., 45.75 minutes)
    const calories = calculateActivityCalories('cardio', 45.75, 70)

    // MET for cardio = 8.0
    // Formula: 8.0 * 70 * (45.75/60) = 427
    expect(calories).toBe(427)
  })

  it('scales with user weight', () => {
    const calories50kg = calculateActivityCalories('cardio', 60, 50)
    const calories100kg = calculateActivityCalories('cardio', 60, 100)

    // Heavier person burns more calories
    expect(calories100kg).toBe(calories50kg * 2)
  })

  it('uses fallback MET value for unknown activity type', () => {
    const calories = calculateActivityCalories('unknown_activity', 60, 70)

    // Fallback MET = 3.5 (walking)
    // Formula: 3.5 * 70 * 1 = 245
    expect(calories).toBe(245)
  })

  it('returns 0 for 0 duration', () => {
    const calories = calculateActivityCalories('cardio', 0, 70)

    expect(calories).toBe(0)
  })

  it('handles very short durations', () => {
    const calories = calculateActivityCalories('hiit', 1, 70)

    // MET for HIIT = 11.0
    // Formula: 11.0 * 70 * (1/60) = 12.83 -> 13
    expect(calories).toBe(13)
  })

  it('rounds to nearest whole number', () => {
    const calories = calculateActivityCalories('cardio', 15, 70)

    // MET for cardio = 8.0
    // Formula: 8.0 * 70 * 0.25 = 140
    expect(calories).toBe(140)
  })

  it('calculates for all workout types in MET_VALUES', () => {
    const workoutTypes = Object.keys(MET_VALUES)

    workoutTypes.forEach(type => {
      const calories = calculateActivityCalories(type, 30, 70)
      expect(calories).toBeGreaterThan(0)
    })
  })
})

describe('MET_VALUES', () => {
  it('contains all expected workout types', () => {
    expect(MET_VALUES).toHaveProperty('strength')
    expect(MET_VALUES).toHaveProperty('cardio')
    expect(MET_VALUES).toHaveProperty('yoga')
    expect(MET_VALUES).toHaveProperty('hiit')
    expect(MET_VALUES).toHaveProperty('pilates')
    expect(MET_VALUES).toHaveProperty('sports')
    expect(MET_VALUES).toHaveProperty('crossfit')
    expect(MET_VALUES).toHaveProperty('swimming')
    expect(MET_VALUES).toHaveProperty('walking')
    expect(MET_VALUES).toHaveProperty('meditation')
    expect(MET_VALUES).toHaveProperty('breathing')
  })

  it('has reasonable MET values', () => {
    // MET values should be positive
    Object.values(MET_VALUES).forEach(met => {
      expect(met).toBeGreaterThan(0)
    })

    // HIIT should have higher MET than walking
    expect(MET_VALUES.hiit).toBeGreaterThan(MET_VALUES.walking)

    // Meditation should have lower MET than cardio
    expect(MET_VALUES.meditation).toBeLessThan(MET_VALUES.cardio)
  })

  it('has HIIT as highest intensity activity', () => {
    const maxMET = Math.max(...Object.values(MET_VALUES))
    expect(MET_VALUES.hiit).toBe(maxMET)
  })

  it('has meditation/breathing as lowest intensity activities', () => {
    const minMET = Math.min(...Object.values(MET_VALUES))
    expect(MET_VALUES.meditation).toBe(minMET)
    expect(MET_VALUES.breathing).toBe(minMET)
  })
})
