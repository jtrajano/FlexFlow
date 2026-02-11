import { useQuery } from '@tanstack/react-query'
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { UserGoals } from '@repo/shared'

export function useUserGoals(userId: string | undefined) {
  return useQuery({
    queryKey: ['userGoals', userId],
    queryFn: async () => {
      if (!userId) return null

      const q = query(
        collection(db, 'userGoals'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(1)
      )

      const querySnapshot = await getDocs(q)
      if (querySnapshot.empty) return null

      return querySnapshot.docs[0].data() as UserGoals
    },
    enabled: !!userId,
  })
}
