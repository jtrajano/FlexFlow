import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import { User } from '@repo/shared'

interface AuthContextType {
  user: FirebaseUser | null
  userData: User | null
  loading: boolean
  error: Error | null
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  error: null,
})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [userData, setUserData] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async firebaseUser => {
      setLoading(true)
      try {
        if (firebaseUser) {
          setUser(firebaseUser)

          // Check if user exists in Firestore
          const userDocRef = doc(db, 'users', firebaseUser.uid)
          const userDocSnap = await getDoc(userDocRef)

          if (!userDocSnap.exists()) {
            // Create initial user record
            const newUserData: User = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              createdAt: new Date().toISOString(),
              lastLoginAt: new Date().toISOString(),
              onBoardingCompleted: false,
              preferredUnits: 'kg',
              trainingGoal: 'General',
            }
            await setDoc(userDocRef, {
              ...newUserData,
              createdAt: serverTimestamp(),
              lastLoginAt: serverTimestamp(),
            })
            setUserData(newUserData)
          } else {
            // Update last login
            const existingData = userDocSnap.data() as User
            await setDoc(
              userDocRef,
              {
                lastLoginAt: serverTimestamp(),
              },
              { merge: true }
            )
            setUserData(existingData)
          }
        } else {
          setUser(null)
          setUserData(null)
        }
      } catch (err) {
        console.error('Error in AuthProvider:', err)
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  const authContextValue = useMemo(
    () => ({ user, userData, loading, error }),
    [user, userData, loading, error]
  )

  return <AuthContext.Provider value={authContextValue}>{children}</AuthContext.Provider>
}
