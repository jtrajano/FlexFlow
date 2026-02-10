import { describe, it, expect } from 'vitest'
import { UserSchema, CreateUserSchema } from './user'

describe('UserSchema', () => {
  it('validates correct user data', () => {
    const result = UserSchema.safeParse({
      uid: '123',
      email: 'test@example.com',
      displayName: 'Test User',
      photoURL: 'https://example.com/photo.jpg',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      preferredUnits: 'kg',
      trainingGoal: 'Strength',
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing uid', () => {
    const result = UserSchema.safeParse({
      email: 'test@example.com',
      displayName: 'Test User',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid email', () => {
    const result = UserSchema.safeParse({
      uid: '123',
      email: 'invalid-email',
      displayName: 'Test User',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    })
    expect(result.success).toBe(false)
  })

  it('allows null email and displayName', () => {
    const result = UserSchema.safeParse({
      uid: '123',
      email: null,
      displayName: null,
      photoURL: null,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    })
    expect(result.success).toBe(true)
  })
})

describe('CreateUserSchema', () => {
  it('validates user creation input', () => {
    const result = CreateUserSchema.safeParse({
      email: 'new@example.com',
      displayName: 'New User',
    })
    expect(result.success).toBe(true)
  })

  it('allows null email on creation', () => {
    const result = CreateUserSchema.safeParse({
      email: null,
      displayName: 'New User',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid email on creation', () => {
    const result = CreateUserSchema.safeParse({
      email: 'bad-email',
      displayName: 'New User',
    })
    expect(result.success).toBe(false)
  })
})
