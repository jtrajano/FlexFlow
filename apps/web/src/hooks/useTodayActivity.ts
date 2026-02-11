import { useQuery } from '@tanstack/react-query'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { ActivityLog } from '@repo/shared'

export function useTodayActivity(userId: string | undefined) {
  return useQuery({
    queryKey: ['activityLogs', 'today', userId],
    queryFn: async () => {
      if (!userId) return []

      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const q = query(
        collection(db, 'activityLogs'),
        where('userId', '==', userId),
        where('timestamp', '>=', today.toISOString()),
        where('timestamp', '<', tomorrow.toISOString())
      )

      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => doc.data() as ActivityLog)
    },
    enabled: !!userId,
  })
}
