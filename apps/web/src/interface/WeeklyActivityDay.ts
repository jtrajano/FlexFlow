import { ActivityStatsItem } from './ActivityStatsItem'

export interface WeeklyActivityDay {
  dayName: string
  activities: Array<ActivityStatsItem>
}
