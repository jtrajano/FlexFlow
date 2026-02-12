export const ACTIVITIES_STEPS_PER_MINUTE: Record<string, number> = {
  running: 160,
  cardio: 140,
  walking: 100,
  hiking: 110,
  sports: 120, // Basketball, Soccer, etc. usually involve running
  dance: 110,
  hiit: 130,
  strength: 30, // Minimal steps, mostly standing/moving between sets
  yoga: 5, // Very minimal
  pilates: 5,
  cycling: 0, // No steps
  swimming: 0,
  rowing: 0,
}

export function estimateSteps(activityType: string, durationMinutes: number): number {
  const stepsPerMin = ACTIVITIES_STEPS_PER_MINUTE[activityType.toLowerCase()] ?? 80 // Default fallback
  return Math.round(stepsPerMin * durationMinutes)
}
