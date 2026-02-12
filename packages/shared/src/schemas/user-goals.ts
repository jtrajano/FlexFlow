import { z } from 'zod'

export const GoalTypeEnum = z.enum(['LoseWeight', 'BuildMuscle', 'StayFit', 'ImproveEndurance'])
export type GoalType = z.infer<typeof GoalTypeEnum>

export const WorkoutTypeDistributionSchema = z.object({
  workoutType: z.string(),
  weeklyMinutes: z.number().min(0),
  weeklySessions: z.number().min(0),
})

export const UserGoalsSchema = z.object({
  uid: z.string().min(1),
  userId: z.string().min(1),
  goalType: GoalTypeEnum,
  weeklyCalorieBurnTarget: z.number().min(0).default(0),
  weeklyWorkoutMinutes: z.number().min(0).default(0),
  weeklyWorkoutFrequencyTarget: z.number().min(0).default(1),
  dailyMoveTarget: z.number().min(0).default(0),
  dailyExerciseTarget: z.number().min(0).default(0),
  activityLevel: z.string(),
  workoutPreferences: z.string().default(''),
  workoutTypeDistribution: z.array(WorkoutTypeDistributionSchema).default([]),
  createdAt: z.string(),
})

export type UserGoals = z.infer<typeof UserGoalsSchema>
