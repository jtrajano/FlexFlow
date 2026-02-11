import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { App } from './App'
import { useAuth } from './hooks/useAuth'
import { User as FirebaseUser } from 'firebase/auth'

// Mock useAuth hook
vi.mock('./hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

vi.mock('./hooks/useUserGoals', () => ({
  useUserGoals: vi.fn(() => ({ data: null, isLoading: false })),
}))

// Mock firebase signOut
vi.mock('firebase/auth', () => ({
  signOut: vi.fn(),
  getAuth: vi.fn(),
  onAuthStateChanged: vi.fn(),
}))

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
    render(<App />)
    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('renders login view when not authenticated', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      userData: null,
      loading: false,
      error: null,
    })
    render(<App />)
    expect(screen.getByText(/Welcome to FlexFlow/i)).toBeInTheDocument()
    expect(screen.getByText(/Continue with Google/i)).toBeInTheDocument()
  })

  it('renders the dashboard when authenticated and onboarded', () => {
    render(<App />)
    // GreetingHeader displays the first name or 'Athlete'
    expect(screen.getByText(/Athlete/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument()
  })
})
