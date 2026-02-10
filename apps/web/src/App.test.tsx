import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { App } from './App'
import { useAuth } from './hooks/useAuth'
import { User as FirebaseUser } from 'firebase/auth'

// Mock useAuth hook
vi.mock('./hooks/useAuth', () => ({
  useAuth: vi.fn(),
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
    // Default to authenticated state
    vi.mocked(useAuth).mockReturnValue({
      user: { email: 'test@example.com' } as unknown as FirebaseUser,
      userData: null,
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

  it('renders the dashboard when authenticated', () => {
    render(<App />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('The Hytel Way')
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument()
  })

  it('renders the counter and works correctly', () => {
    render(<App />)
    expect(screen.getByText('0')).toBeInTheDocument()
    const increaseButton = screen.getByRole('button', { name: /increment counter/i })
    fireEvent.click(increaseButton)
    expect(screen.getByText('1')).toBeInTheDocument()
  })
})
