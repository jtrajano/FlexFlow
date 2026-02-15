/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { App } from './App'
import { useAuth } from './hooks/useAuth'
import { User as FirebaseUser } from 'firebase/auth'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Mock useAuth hook
vi.mock('./hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

vi.mock('./hooks/useUserGoals', () => ({
  useUserGoals: vi.fn(() => ({ data: null, isLoading: false })),
}))

vi.mock('./hooks/useTodayActivity', () => ({
  useTodayActivity: vi.fn(() => ({ data: [], isLoading: false, error: null })),
}))

vi.mock('./hooks/useWeeklyActivity', () => ({
  useWeeklyActivity: vi.fn(() => ({ data: [], isLoading: false, error: null })),
}))

vi.mock('./hooks/useBodyMetrics', () => ({
  useLatestBodyMetrics: vi.fn(() => ({ data: null, isLoading: false, error: null })),
}))

// Mock firebase signOut
vi.mock('firebase/auth', () => ({
  signOut: vi.fn(),
  getAuth: vi.fn(),
  onAuthStateChanged: vi.fn(),
}))

// Mock Firebase
vi.mock('./lib/firebase', () => ({
  db: {},
}))

const createMockDocSnap = (data: any) => ({
  data: () => data,
  exists: () => !!data,
})

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn(() =>
    Promise.resolve(
      createMockDocSnap({
        userId: 'test-user-123',
        name: 'Test User',
        gender: 'male',
        height: 180,
        birthdate: '1990-01-01',
        profileVisibility: 'Private',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    )
  ),
  setDoc: vi.fn(() => Promise.resolve()),
}))

// Mock Framer Motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    circle: ({ ...props }: any) => <circle {...props} />,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default to authenticated and onboarded state
    vi.mocked(useAuth).mockReturnValue({
      user: { email: 'test@example.com' } as unknown as FirebaseUser,
      userData: {
        uid: '123',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: null,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        onBoardingCompleted: true,
        preferredUnits: 'kg',
        trainingGoal: 'General',
      },
      loading: false,
      error: null,
    })
  })

  it('renders loading state', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      userData: null,
      loading: true,
      error: null,
    })
    render(<App />, { wrapper: createWrapper() })
    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('renders login view when not authenticated', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      userData: null,
      loading: false,
      error: null,
    })
    render(<App />, { wrapper: createWrapper() })
    expect(screen.getByRole('heading', { name: /Welcome to/i })).toBeInTheDocument()
    expect(screen.getByText(/FlexFlow/i)).toBeInTheDocument()
    expect(screen.getByText(/Continue with Google/i)).toBeInTheDocument()
  })

  it('renders the dashboard when authenticated and onboarded', () => {
    render(<App />, { wrapper: createWrapper() })
    // GreetingHeader displays the first name or 'Athlete'
    expect(screen.getByText(/Athlete/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument()
  })
})
