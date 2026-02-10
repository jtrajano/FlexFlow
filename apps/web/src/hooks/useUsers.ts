import { useQuery, useMutation } from '@tanstack/react-query'
import { collection, getDocs, doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { User } from '@repo/shared'

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const querySnapshot = await getDocs(collection(db, 'users'))
      return querySnapshot.docs.map(doc => doc.data() as User)
    },
  })
}

export function useUser(uid: string) {
  return useQuery({
    queryKey: ['users', uid],
    queryFn: async () => {
      const docSnap = await getDoc(doc(db, 'users', uid))
      return docSnap.data() as User
    },
    enabled: !!uid,
  })
}

export function useCreateUser() {
  return useMutation({
    mutationFn: async (user: User) => {
      await setDoc(doc(db, 'users', user.uid), user)
      return user
    },
  })
}
