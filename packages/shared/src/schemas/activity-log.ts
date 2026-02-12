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
  durationMinutes: z.number().min(0),
  caloriesBurned: z.number().min(0),
  timestamp: z.string(), // ISO string
  date: z.string(), // YYYY-MM-DD
  status: z.enum(['in_progress', 'completed']).optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  notes: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
})

export type ActivityLog = z.infer<typeof ActivityLogSchema>
