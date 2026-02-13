import { ActivityLog } from '@repo/shared'

type ActivityLogLike = Partial<ActivityLog>

function parseDate(value?: string): Date | null {
  if (!value) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function getActivityStatus(activity: ActivityLogLike): 'in_progress' | 'completed' {
  return activity.status === 'in_progress' ? 'in_progress' : 'completed'
}

export function isCompletedActivity(activity: ActivityLogLike): boolean {
  return getActivityStatus(activity) === 'completed'
}

/**
 * Calculates activity duration in precise minutes
 * @param activity - Activity log object
 * @param now - Current time (defaults to current date/time)
 * @returns Duration in minutes (precise decimal value, not rounded)
 */
export function getActivityDurationMinutes(
  activity: ActivityLogLike,
  now: Date = new Date()
): number {
  const status = getActivityStatus(activity)
  const start = parseDate(activity.startTime || activity.timestamp)
  const end = parseDate(activity.endTime)

  if (status === 'in_progress' && start) {
    // Calculate precise duration in minutes (milliseconds / 60000)
    const diffMs = now.getTime() - start.getTime()
    return Math.max(0, diffMs / 60000)
  }

  if (start && end) {
    // Calculate precise duration in minutes (milliseconds / 60000)
    const diffMs = end.getTime() - start.getTime()
    return Math.max(0, diffMs / 60000)
  }

  return Math.max(0, activity.durationMinutes || 0)
}
