import { describe, it, expect } from 'vitest'
import { UserProfileSchema } from './user-profile'

describe('UserProfileSchema', () => {
  it('validates correct user profile data', () => {
    const result = UserProfileSchema.safeParse({
      userId: 'user123',
      name: 'John Doe',
      gender: 'male',
      height: 180,
      birthdate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    expect(result.success).toBe(true)
  })

  it('allows null name, gender and height', () => {
    const result = UserProfileSchema.safeParse({
      userId: 'user123',
      name: null,
      gender: null,
      height: null,
      birthdate: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing userId', () => {
    const result = UserProfileSchema.safeParse({
      gender: 'female',
      height: 165,
      birthdate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    expect(result.success).toBe(false)
  })
})
