import { z } from 'zod'

export const UserProfileSchema = z.object({
  userId: z.string().min(1),
  name: z.string().nullable(),
  gender: z.string().nullable(),
  height: z.number().nullable(),
  birthdate: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type UserProfile = z.infer<typeof UserProfileSchema>
