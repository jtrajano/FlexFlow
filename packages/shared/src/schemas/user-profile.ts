import { z } from 'zod'

export const UserProfileSchema = z.object({
  userId: z.string().min(1),
  name: z.string().nullable(),
  gender: z.string().nullable(),
  height: z.number().nullable(),
  birthdate: z.string().nullable(),
  profileVisibility: z.enum(['Private', 'Friends Only', 'Public']).default('Private'),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type UserProfile = z.infer<typeof UserProfileSchema>
