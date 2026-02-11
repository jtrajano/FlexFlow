import { z } from 'zod'

export const ActivityTypeEnum = z.enum([
  'strength',
  'cardio',
  'yoga',
  'hiit',
  'pilates',
  'sports',
  'crossfit',
  'swimming',
  'walking',
])

export type ActivityType = z.infer<typeof ActivityTypeEnum>

export const ActivityLogSchema = z.object({
  uid: z.string().min(1),
  userId: z.string().min(1),
  type: ActivityTypeEnum,
  durationMinutes: z.number().min(1),
  caloriesBurned: z.number().min(0),
  timestamp: z.string(), // ISO string
  date: z.string(), // YYYY-MM-DD
  notes: z.string().optional(),
})

export type ActivityLog = z.infer<typeof ActivityLogSchema>
