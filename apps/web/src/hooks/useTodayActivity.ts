import { useQuery } from '@tanstack/react-query'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { ActivityLog } from '@repo/shared'

export function useTodayActivity(userId: string | undefined) {
  return useQuery({
    queryKey: ['activityLogs', 'today', userId],
    queryFn: async () => {
      if (!userId) return []

      const todayStr = new Date().toLocaleDateString('en-CA') // YYYY-MM-DD in local time

      const q = query(collection(db, 'activityLogs'), where('userId', '==', userId))

      const querySnapshot = await getDocs(q)
      const allActivities = querySnapshot.docs.map(
        doc =>
          ({
            uid: doc.id,
            ...doc.data(),
          }) as ActivityLog
      )

      // Filter for today's logs in local time
      return allActivities.filter(act => {
        // Handle both ISO string timestamps and the new 'date' field
        const logDate =
          act.date || (act.timestamp ? new Date(act.timestamp).toLocaleDateString('en-CA') : null)
        return logDate === todayStr
      })
    },
    enabled: !!userId,
  })
}
