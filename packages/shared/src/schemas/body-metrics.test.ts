import { describe, it, expect } from 'vitest'
import { BodyMetricsSchema } from './body-metrics'

describe('BodyMetricsSchema', () => {
  it('validates correct body metrics data', () => {
    const result = BodyMetricsSchema.safeParse({
      uid: 'metric123',
      userId: 'user123',
      weight: 85.5,
      bodyFatPercent: 15.2,
      recordedAt: new Date().toISOString(),
    })
    expect(result.success).toBe(true)
  })

  it('allows null bodyFatPercent', () => {
    const result = BodyMetricsSchema.safeParse({
      uid: 'metric123',
      userId: 'user123',
      weight: 70,
      bodyFatPercent: null,
      recordedAt: new Date().toISOString(),
    })
    expect(result.success).toBe(true)
  })

  it('rejects zero or negative weight', () => {
    const result = BodyMetricsSchema.safeParse({
      uid: 'metric123',
      userId: 'user123',
      weight: 0,
      bodyFatPercent: 10,
      recordedAt: new Date().toISOString(),
    })
    expect(result.success).toBe(false)
  })

  it('rejects missing recordedAt', () => {
    const result = BodyMetricsSchema.safeParse({
      uid: 'metric123',
      userId: 'user123',
      weight: 75,
      bodyFatPercent: 12,
    })
    expect(result.success).toBe(false)
  })
})
