import { z } from 'zod'

export const UserSchema = z.object({
  uid: z.string().min(1),
  email: z.string().email().nullable(),
  displayName: z.string().nullable(),
  photoURL: z.string().nullable(),
  createdAt: z.string(),
  lastLoginAt: z.string(),
  preferredUnits: z.enum(['kg', 'lbs']).default('kg'),
  trainingGoal: z.enum(['Strength', 'Hypertrophy', 'General']).default('General'),
})

export const CreateUserSchema = z.object({
  email: z.string().email().nullable(),
  displayName: z.string().nullable(),
})

export type User = z.infer<typeof UserSchema>
export type CreateUser = z.infer<typeof CreateUserSchema>
