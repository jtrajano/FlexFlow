import { useQuery } from '@tanstack/react-query'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { ActivityLog } from '@repo/shared'

export function useWeeklyActivity(userId: string | undefined) {
  return useQuery({
    queryKey: ['activityLogs', 'weekly', userId],
    queryFn: async () => {
      if (!userId) return []

      const q = query(collection(db, 'activityLogs'), where('userId', '==', userId))

      const querySnapshot = await getDocs(q)
      const allActivities = querySnapshot.docs.map(
        doc =>
          ({
            uid: doc.id,
            ...doc.data(),
          }) as ActivityLog
      )

      // Get dates for last 7 days
      const dates = Array.from({ length: 7 }, (_, i) => {
        const d = new Date()
        d.setDate(d.getDate() - i)
        return d.toLocaleDateString('en-CA')
      }).reverse()

      // Map activities to those 7 days
      return dates.map(date => ({
        date,
        dayName: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        activities: allActivities.filter(act => {
          const logDate =
            act.date || (act.timestamp ? new Date(act.timestamp).toLocaleDateString('en-CA') : null)
          return logDate === date
        }),
      }))
    },
    enabled: !!userId,
  })
}
