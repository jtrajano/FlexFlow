import { useQuery } from '@tanstack/react-query'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { ActivityLog } from '@repo/shared'
import { db } from '../lib/firebase'

export function useRunningActivity(userId: string | undefined) {
  return useQuery({
    queryKey: ['activityLogs', 'running', userId],
    queryFn: async () => {
      if (!userId) return null

      const q = query(collection(db, 'activityLogs'), where('userId', '==', userId))
      const querySnapshot = await getDocs(q)
      const allActivities = querySnapshot.docs.map(
        doc =>
          ({
            uid: doc.id,
            ...doc.data(),
          }) as ActivityLog
      )

      const inProgressActivities = allActivities
        .filter(activity => activity.status === 'in_progress')
        .sort((a, b) => {
          const aTime = new Date(a.startTime || a.timestamp).getTime()
          const bTime = new Date(b.startTime || b.timestamp).getTime()
          return bTime - aTime
        })

      return inProgressActivities[0] || null
    },
    enabled: !!userId,
  })
}
