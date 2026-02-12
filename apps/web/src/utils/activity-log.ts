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

export function getActivityDurationMinutes(
  activity: ActivityLogLike,
  now: Date = new Date()
): number {
  const status = getActivityStatus(activity)
  const start = parseDate(activity.startTime || activity.timestamp)
  const end = parseDate(activity.endTime)

  if (status === 'in_progress' && start) {
    const diff = now.getTime() - start.getTime()
    return Math.max(0, Math.round(diff / 60000))
  }

  if (start && end) {
    const diff = end.getTime() - start.getTime()
    return Math.max(0, Math.round(diff / 60000))
  }

  return Math.max(0, activity.durationMinutes || 0)
}
