import { useQuery } from '@tanstack/react-query'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { ActivityLog } from '@repo/shared'
import { db } from '../lib/firebase'

function getSortTime(activity: ActivityLog): number {
  const raw = activity.startTime || activity.timestamp || activity.endTime
  const parsed = raw ? new Date(raw).getTime() : 0
  return Number.isNaN(parsed) ? 0 : parsed
}

export function useActivityHistory(userId: string | undefined) {
  return useQuery({
    queryKey: ['activityLogs', 'history', userId],
    queryFn: async () => {
      if (!userId) return []

      const q = query(collection(db, 'activityLogs'), where('userId', '==', userId))
      const querySnapshot = await getDocs(q)
      const activities = querySnapshot.docs.map(
        doc =>
          ({
            uid: doc.id,
            ...doc.data(),
          }) as ActivityLog
      )

      return activities.sort((a, b) => getSortTime(b) - getSortTime(a))
    },
    enabled: !!userId,
  })
}
