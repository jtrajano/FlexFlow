import { z } from 'zod'

export const BodyMetricsSchema = z.object({
  uid: z.string().min(1),
  userId: z.string().min(1),
  weight: z.number().positive(),
  bodyFatPercent: z.number().nullable(),
  recordedAt: z.string(),
})

export type BodyMetrics = z.infer<typeof BodyMetricsSchema>
