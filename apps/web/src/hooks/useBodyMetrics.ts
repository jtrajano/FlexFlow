import { useQuery } from '@tanstack/react-query'
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { BodyMetrics } from '@repo/shared'

export function useLatestBodyMetrics(userId: string | undefined) {
  return useQuery({
    queryKey: ['bodyMetrics', 'latest', userId],
    queryFn: async () => {
      if (!userId) return null

      const q = query(
        collection(db, 'bodyMetrics'),
        where('userId', '==', userId),
        orderBy('recordedAt', 'desc'),
        limit(1)
      )

      const querySnapshot = await getDocs(q)
      if (querySnapshot.empty) return null

      return querySnapshot.docs[0].data() as BodyMetrics
    },
    enabled: !!userId,
  })
}
