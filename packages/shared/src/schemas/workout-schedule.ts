import { z } from 'zod'

export const DayOfWeekEnum = z.enum([
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
])
export type DayOfWeek = z.infer<typeof DayOfWeekEnum>

export const WorkoutScheduleItemSchema = z.object({
  dayOfWeek: DayOfWeekEnum,
  workoutType: z.string().nullable().optional(), // null or empty for rest days
  durationMinutes: z.number().min(0).default(0),
  timeOfDay: z.string().default('18:00'),
  isRestDay: z.boolean().default(false),
})

export const WorkoutScheduleSchema = z.object({
  uid: z.string().optional(),
  userId: z.string(),
  userGoalId: z.string(),
  items: z.array(WorkoutScheduleItemSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type WorkoutScheduleItem = z.infer<typeof WorkoutScheduleItemSchema>
export type WorkoutSchedule = z.infer<typeof WorkoutScheduleSchema>
