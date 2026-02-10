import { z } from 'zod'
import { router, publicProcedure } from '../trpc'
import { CreateUserSchema, UserSchema } from '@repo/shared'

export const userRouter = router({
  create: publicProcedure
    .input(CreateUserSchema)
    .output(UserSchema)
    .mutation(({ input }) => ({
      uid: 'dummy-id',
      email: input.email,
      displayName: input.displayName,
      photoURL: null,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      preferredUnits: 'kg' as const,
      trainingGoal: 'General' as const,
    })),

  getById: publicProcedure
    .input(z.string())
    .output(UserSchema)
    .query(({ input }) => ({
      uid: input,
      email: 'test@example.com',
      displayName: 'Test User',
      photoURL: null,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      preferredUnits: 'kg' as const,
      trainingGoal: 'General' as const,
    })),

  list: publicProcedure.output(z.array(UserSchema)).query(() => [
    {
      uid: 'user-1',
      email: 'user1@example.com',
      displayName: 'User One',
      photoURL: null,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      preferredUnits: 'kg' as const,
      trainingGoal: 'General' as const,
    },
    {
      uid: 'user-2',
      email: 'user2@example.com',
      displayName: 'User Two',
      photoURL: null,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      preferredUnits: 'kg' as const,
      trainingGoal: 'General' as const,
    },
  ]),
})
