import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, waitFor, screen } from '@testing-library/react'
import { AuthProvider, useAuth } from './AuthProvider'
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth'
import { getDoc, setDoc, DocumentSnapshot } from 'firebase/firestore'
import React from 'react'

// Mock Firebase
vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn(),
  getAuth: vi.fn(),
}))

vi.mock('firebase/firestore', () => ({
  doc: vi.fn((_db, _coll, _id) => ({ id: _id, path: `${_coll}/${_id}` })),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  serverTimestamp: vi.fn(() => 'mock-timestamp'),
  getFirestore: vi.fn(),
}))

vi.mock('../lib/firebase', () => ({
  auth: { name: 'mock-auth' },
  db: { name: 'mock-db' },
}))

const TestComponent = () => {
  const { user, userData, loading } = useAuth()
  if (loading) return <div>Loading...</div>
  return (
    <div>
      <div data-testid="user">{user?.email || 'no-user'}</div>
      <div data-testid="userData">{userData?.uid || 'no-data'}</div>
    </div>
  )
}

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading initially', () => {
    vi.mocked(onAuthStateChanged).mockReturnValue(vi.fn())
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('handles no user logged in', async () => {
    vi.mocked(onAuthStateChanged).mockImplementation((_auth, callback) => {
      setTimeout(() => (callback as (user: FirebaseUser | null) => void)(null), 0)
      return vi.fn()
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })
    expect(screen.getByTestId('user')).toHaveTextContent('no-user')
  })

  it('creates a new user record in Firestore if it does not exist', async () => {
    const mockFirebaseUser = {
      uid: 'new-user-123',
      email: 'new@example.com',
      displayName: 'New User',
      photoURL: null,
    }

    vi.mocked(onAuthStateChanged).mockImplementation((_auth, callback) => {
      setTimeout(
        () =>
          (callback as (user: FirebaseUser | null) => void)(
            mockFirebaseUser as unknown as FirebaseUser
          ),
        0
      )
      return vi.fn()
    })
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => false,
    } as unknown as DocumentSnapshot)

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => expect(setDoc).toHaveBeenCalled(), { timeout: 4000 })

    expect(setDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        uid: 'new-user-123',
        email: 'new@example.com',
      })
    )
  })

  it('updates the lastLoginAt for an existing user', async () => {
    const mockFirebaseUser = {
      uid: 'existing-user-456',
      email: 'existing@example.com',
    }

    const mockStoredData = {
      uid: 'existing-user-456',
      email: 'existing@example.com',
      preferredUnits: 'lbs',
    }

    vi.mocked(onAuthStateChanged).mockImplementation((_auth, callback) => {
      setTimeout(
        () =>
          (callback as (user: FirebaseUser | null) => void)(
            mockFirebaseUser as unknown as FirebaseUser
          ),
        0
      )
      return vi.fn()
    })
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => true,
      data: () => mockStoredData,
    } as unknown as DocumentSnapshot)

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(
      () => {
        expect(setDoc).toHaveBeenCalledWith(
          expect.anything(),
          { lastLoginAt: 'mock-timestamp' },
          { merge: true }
        )
      },
      { timeout: 4000 }
    )
  })
})
