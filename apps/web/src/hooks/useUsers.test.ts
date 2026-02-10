import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { useUsers, useUser, useCreateUser } from './useUsers'
import { getDocs, getDoc, setDoc } from 'firebase/firestore'

// Mock firebase lib
vi.mock('../lib/firebase', () => ({
  db: { type: 'firestore' },
}))

// Mock firebase/firestore
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  getDocs: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useUsers', () => {
  it('returns user list data', async () => {
    const mockUsers = [
      { uid: 'user-1', email: 'user1@example.com', displayName: 'User One' },
      { uid: 'user-2', email: 'user2@example.com', displayName: 'User Two' },
    ]
    vi.mocked(getDocs).mockResolvedValue({
      docs: mockUsers.map(user => ({
        data: () => user,
      })),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    const { result } = renderHook(() => useUsers(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockUsers)
  })
})

describe('useUser', () => {
  it('returns single user by uid', async () => {
    const mockUser = { uid: 'user-1', email: 'user1@example.com', displayName: 'User One' }
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => true,
      data: () => mockUser,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    const { result } = renderHook(() => useUser('user-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockUser)
  })
})

describe('useCreateUser', () => {
  it('returns mutation function and calls setDoc', async () => {
    const newUser = { uid: 'new-user', email: 'new@example.com', displayName: 'New User' }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(setDoc).mockResolvedValue(undefined as any)

    const { result } = renderHook(() => useCreateUser(), {
      wrapper: createWrapper(),
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await result.current.mutateAsync(newUser as any)
    expect(setDoc).toHaveBeenCalled()
  })
})
