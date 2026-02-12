import { useQuery } from '@tanstack/react-query'
import { collection, query, where, getDocs, limit } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { WorkoutSchedule } from '@repo/shared'

export function useUserSchedule(userId: string | undefined) {
  return useQuery({
    queryKey: ['userSchedule', userId],
    queryFn: async () => {
      if (!userId) return null

      const q = query(
        collection(db, 'userWorkoutSchedules'),
        where('userId', '==', userId),
        limit(1)
      )

      const querySnapshot = await getDocs(q)
      if (querySnapshot.empty) return null

      return querySnapshot.docs[0].data() as WorkoutSchedule
    },
    enabled: !!userId,
  })
}

export function useTodaySchedule(userId: string | undefined) {
  const { data: schedule, ...rest } = useUserSchedule(userId)

  const days: (
    | 'Sunday'
    | 'Monday'
    | 'Tuesday'
    | 'Wednesday'
    | 'Thursday'
    | 'Friday'
    | 'Saturday'
  )[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  const todayName = days[new Date().getDay()]

  const todayWorkout = schedule?.items.find(item => item.dayOfWeek === todayName)

  return {
    todayWorkout,
    isRestDay: todayWorkout?.isRestDay ?? true,
    ...rest,
  }
}
