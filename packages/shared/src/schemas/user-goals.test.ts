import { describe, it, expect } from 'vitest'
import { UserGoalsSchema } from './user-goals'

describe('UserGoalsSchema', () => {
  it('validates correct user goals data', () => {
    const result = UserGoalsSchema.safeParse({
      uid: 'goal123',
      userId: 'user123',
      goalType: 'LoseWeight',
      weeklyWorkoutMinutes: 30,
      weeklyWorkoutFrequencyTarget: 3,
      weeklyCalorieBurnTarget: 500,
      activityLevel: 'Sedentary',
      workoutPreferences: 'strength,cardio',
      createdAt: new Date().toISOString(),
    })
    expect(result.success).toBe(true)
  })

  it('defaults values correctly if omitted', () => {
    const result = UserGoalsSchema.safeParse({
      uid: 'goal123',
      userId: 'user123',
      goalType: 'BuildMuscle',
      activityLevel: 'Sedentary',
      createdAt: new Date().toISOString(),
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.weeklyWorkoutFrequencyTarget).toBe(1)
      expect(result.data.weeklyCalorieBurnTarget).toBe(0)
      expect(result.data.weeklyWorkoutMinutes).toBe(0)
      expect(result.data.workoutPreferences).toBe('')
      expect(result.data.workoutTypeDistribution).toEqual([])
    }
  })

  it('validates correct workout distribution data', () => {
    const result = UserGoalsSchema.safeParse({
      uid: 'goal123',
      userId: 'user123',
      goalType: 'StayFit',
      activityLevel: 'Active',
      workoutTypeDistribution: [{ workoutType: 'weights', weeklyMinutes: 100, weeklySessions: 2 }],
      createdAt: new Date().toISOString(),
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.workoutTypeDistribution).toHaveLength(1)
      expect(result.data.workoutTypeDistribution[0].workoutType).toBe('weights')
    }
  })

  it('validates all goal types', () => {
    ;(['LoseWeight', 'BuildMuscle', 'StayFit', 'ImproveEndurance'] as const).forEach(goalType => {
      const result = UserGoalsSchema.safeParse({
        uid: 'goal123',
        userId: 'user123',
        goalType,
        weeklyWorkoutMinutes: 30,
        weeklyWorkoutFrequencyTarget: 4,
        weeklyCalorieBurnTarget: 500,
        activityLevel: 'Sedentary',
        createdAt: new Date().toISOString(),
      })
      expect(result.success).toBe(true)
    })
  })

  it('rejects invalid goal type', () => {
    const result = UserGoalsSchema.safeParse({
      uid: 'goal123',
      userId: 'user123',
      goalType: 'GetRich',
      activityLevel: 'Sedentary',
      createdAt: new Date().toISOString(),
    })
    expect(result.success).toBe(false)
  })

  it('rejects negative values', () => {
    const result = UserGoalsSchema.safeParse({
      uid: 'goal123',
      userId: 'user123',
      goalType: 'StayFit',
      weeklyWorkoutFrequencyTarget: -1,
      activityLevel: 'Sedentary',
      createdAt: new Date().toISOString(),
    })
    expect(result.success).toBe(false)
  })
})
