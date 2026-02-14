import { describe, it, expect } from 'vitest'
import { buildWorkoutDistributionData } from './WorkoutDistributionChart'

describe('buildWorkoutDistributionData', () => {
  it('returns empty distribution for no activities', () => {
    const result = buildWorkoutDistributionData([])

    expect(result.total).toBe(0)
    expect(result.slices).toEqual([])
  })

  it('builds grouped slices with rounded percentages', () => {
    const result = buildWorkoutDistributionData([
      { type: 'cardio', durationMinutes: 30, caloriesBurned: 220 },
      { type: 'strength', durationMinutes: 45, caloriesBurned: 300 },
      { type: 'cardio', durationMinutes: 20, caloriesBurned: 180 },
    ])

    expect(result.total).toBe(3)
    expect(result.slices).toHaveLength(2)

    expect(result.slices[0]).toMatchObject({
      type: 'cardio',
      percentage: 67,
      isFullSlice: false,
      color: '#a3e635',
    })
    expect(result.slices[0].path).not.toBe('')

    expect(result.slices[1]).toMatchObject({
      type: 'strength',
      percentage: 33,
      isFullSlice: false,
      color: '#60a5fa',
    })
    expect(result.slices[1].path).not.toBe('')
  })

  it('marks a single-type distribution as a full slice', () => {
    const result = buildWorkoutDistributionData([
      { type: 'yoga', durationMinutes: 40, caloriesBurned: 190 },
    ])

    expect(result.total).toBe(1)
    expect(result.slices).toHaveLength(1)
    expect(result.slices[0]).toMatchObject({
      type: 'yoga',
      percentage: 100,
      isFullSlice: true,
      path: '',
      color: '#a3e635',
    })
  })

  it('cycles colors when slice count exceeds palette length', () => {
    const result = buildWorkoutDistributionData([
      { type: 'cardio', durationMinutes: 10, caloriesBurned: 50 },
      { type: 'strength', durationMinutes: 10, caloriesBurned: 50 },
      { type: 'yoga', durationMinutes: 10, caloriesBurned: 50 },
      { type: 'hiit', durationMinutes: 10, caloriesBurned: 50 },
      { type: 'swim', durationMinutes: 10, caloriesBurned: 50 },
      { type: 'run', durationMinutes: 10, caloriesBurned: 50 },
      { type: 'pilates', durationMinutes: 10, caloriesBurned: 50 },
    ])

    expect(result.slices).toHaveLength(7)
    expect(result.slices[0].color).toBe('#a3e635')
    expect(result.slices[6].color).toBe('#a3e635')
  })
})
