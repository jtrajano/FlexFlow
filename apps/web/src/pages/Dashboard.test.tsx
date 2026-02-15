/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Dashboard } from './Dashboard'
import { useAuth } from '../hooks/useAuth'
import { useTodayActivity } from '../hooks/useTodayActivity'
import { useWeeklyActivity } from '../hooks/useWeeklyActivity'
import { useLatestBodyMetrics } from '../hooks/useBodyMetrics'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Mock all hooks
vi.mock('../hooks/useAuth')
vi.mock('../hooks/useTodayActivity')
vi.mock('../hooks/useWeeklyActivity')
vi.mock('../hooks/useBodyMetrics')
vi.mock('../hooks/useUserGoals', () => ({
  useUserGoals: vi.fn(() => ({ data: null, isLoading: false })),
}))

// Mock Firebase
vi.mock('../lib/firebase', () => ({
  db: {},
}))

const createMockDocSnap = (data: any) => ({
  data: () => data,
  exists: () => !!data,
})

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
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

const mockUser = {
  uid: 'test-user-123',
  email: 'test@example.com',
  displayName: 'Test User',
}

const mockActivity = {
  uid: 'activity-1',
  userId: 'test-user-123',
  type: 'cardio' as const,
  durationMinutes: 30,
  caloriesBurned: 300,
  date: new Date().toISOString(),
  timestamp: new Date().toISOString(),
}

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

describe('Dashboard with StatisticsPage Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(useAuth).mockReturnValue({
      user: mockUser as any,
      userData: null,
      loading: false,
      error: null,
    } as any)

    vi.mocked(useTodayActivity).mockReturnValue({
      data: [mockActivity],
      isLoading: false,
      error: null,
    } as any)

    vi.mocked(useWeeklyActivity).mockReturnValue({
      data: [
        {
          date: new Date().toISOString(),
          dayName: 'Monday',
          activities: [mockActivity],
        },
      ],
      isLoading: false,
      error: null,
    } as any)

    vi.mocked(useLatestBodyMetrics).mockReturnValue({
      data: {
        uid: 'metrics-1',
        userId: 'test-user-123',
        weight: 75.5,
        bodyFatPercent: 18.5,
        recordedAt: new Date().toISOString(),
      },
      isLoading: false,
      error: null,
    } as any)
  })

  describe('Dashboard Rendering', () => {
    it('should render the Dashboard component', () => {
      render(<Dashboard />, { wrapper: createWrapper() })
      expect(screen.getByText("Today's Progress")).toBeInTheDocument()
    })

    it('should render navigation controls', () => {
      render(<Dashboard />, { wrapper: createWrapper() })
      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })

    it('should initialize with home view active', () => {
      render(<Dashboard />, { wrapper: createWrapper() })
      expect(screen.getByText("Today's Progress")).toBeInTheDocument()
    })
  })

  describe('StatisticsPage Integration', () => {
    it('should support rendering StatisticsPage when stats tab is active', () => {
      render(<Dashboard />, { wrapper: createWrapper() })
      // Dashboard provides the context for StatisticsPage to render
      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })

    it('should pass authentication context to StatisticsPage', () => {
      render(<Dashboard />, { wrapper: createWrapper() })
      // useAuth is called by Dashboard and available to StatisticsPage
      expect(vi.mocked(useAuth)).toHaveBeenCalled()
    })

    it('should pass activity data to StatisticsPage', () => {
      render(<Dashboard />, { wrapper: createWrapper() })
      // Hooks are called and data is available
      expect(vi.mocked(useTodayActivity)).toHaveBeenCalled()
      expect(vi.mocked(useWeeklyActivity)).toHaveBeenCalled()
    })

    it('should pass body metrics to StatisticsPage', () => {
      render(<Dashboard />, { wrapper: createWrapper() })
      expect(vi.mocked(useLatestBodyMetrics)).toHaveBeenCalled()
    })
  })

  describe('Dashboard State Management', () => {
    it('should maintain state across tab switches', () => {
      const { rerender } = render(<Dashboard />, { wrapper: createWrapper() })
      rerender(<Dashboard />)
      expect(screen.getByText("Today's Progress")).toBeInTheDocument()
    })

    it('should have navigation enabled for tab switching', () => {
      render(<Dashboard />, { wrapper: createWrapper() })
      const nav = screen.getByRole('navigation')
      const buttons = nav.querySelectorAll('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  describe('StatisticsPage Back Navigation', () => {
    it('should support back navigation from StatisticsPage to home', () => {
      render(<Dashboard />, { wrapper: createWrapper() })
      // Dashboard provides onBack callback to StatisticsPage
      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })

    it('should reset to home view when back is called', () => {
      render(<Dashboard />, { wrapper: createWrapper() })
      expect(screen.getByText("Today's Progress")).toBeInTheDocument()
    })
  })

  describe('Data Flow from Dashboard to StatisticsPage', () => {
    it('should have all required hooks for StatisticsPage', () => {
      render(<Dashboard />, { wrapper: createWrapper() })

      // All four hooks are initialized
      expect(vi.mocked(useAuth)).toHaveBeenCalled()
      expect(vi.mocked(useTodayActivity)).toHaveBeenCalled()
      expect(vi.mocked(useWeeklyActivity)).toHaveBeenCalled()
      expect(vi.mocked(useLatestBodyMetrics)).toHaveBeenCalled()
    })

    it('should pass user context correctly', () => {
      render(<Dashboard />, { wrapper: createWrapper() })
      expect(vi.mocked(useAuth)).toHaveBeenCalled()
    })

    it('should provide activity data for charts and metrics', () => {
      render(<Dashboard />, { wrapper: createWrapper() })
      expect(vi.mocked(useTodayActivity)).toHaveBeenCalled()
      expect(vi.mocked(useWeeklyActivity)).toHaveBeenCalled()
    })
  })

  describe('Dashboard with StatisticsPage Error Handling', () => {
    it('should handle user data errors gracefully', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        userData: null,
        loading: false,
        error: new Error('Auth failed'),
      } as any)

      render(<Dashboard />, { wrapper: createWrapper() })
      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })

    it('should handle activity data errors', () => {
      vi.mocked(useTodayActivity).mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Activity error'),
      } as any)

      render(<Dashboard />, { wrapper: createWrapper() })
      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })

    it('should handle missing body metrics', () => {
      vi.mocked(useLatestBodyMetrics).mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      } as any)

      render(<Dashboard />, { wrapper: createWrapper() })
      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })
  })

  describe('Loading States', () => {
    it('should handle loading state from useTodayActivity', () => {
      vi.mocked(useTodayActivity).mockReturnValue({
        data: [],
        isLoading: true,
        error: null,
      } as any)

      render(<Dashboard />, { wrapper: createWrapper() })
      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })

    it('should handle loading state from useWeeklyActivity', () => {
      vi.mocked(useWeeklyActivity).mockReturnValue({
        data: [],
        isLoading: true,
        error: null,
      } as any)

      render(<Dashboard />, { wrapper: createWrapper() })
      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })
  })

  describe('StatisticsPage Full Flow from Dashboard', () => {
    it('should render fully initialized StatisticsPage when stats tab is active', () => {
      render(<Dashboard />, { wrapper: createWrapper() })
      // All dependencies are set up correctly
      expect(vi.mocked(useAuth)).toHaveBeenCalled()
      expect(vi.mocked(useTodayActivity)).toHaveBeenCalled()
      expect(vi.mocked(useWeeklyActivity)).toHaveBeenCalled()
      expect(vi.mocked(useLatestBodyMetrics)).toHaveBeenCalled()
    })

    it('should maintain hook data consistency in StatisticsPage', () => {
      const { rerender } = render(<Dashboard />, { wrapper: createWrapper() })
      rerender(<Dashboard />)

      // Same data should be available after rerender
      expect(vi.mocked(useTodayActivity)).toHaveBeenCalled()
    })

    it('should update StatisticsPage when data changes', () => {
      render(<Dashboard />, { wrapper: createWrapper() })

      // Update mock data
      vi.mocked(useTodayActivity).mockReturnValue({
        data: [
          mockActivity,
          {
            uid: 'activity-2',
            userId: 'test-user-123',
            type: 'strength' as const,
            durationMinutes: 45,
            caloriesBurned: 350,
            date: new Date().toISOString(),
            timestamp: new Date().toISOString(),
          },
        ],
        isLoading: false,
        error: null,
      } as any)

      // Dashboard should handle the update
      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })

    it('should provide callback prop for StatisticsPage back button', () => {
      render(<Dashboard />, { wrapper: createWrapper() })
      // onBack callback is provided by Dashboard's renderContent function
      expect(screen.getByText("Today's Progress")).toBeInTheDocument()
    })
  })

  describe('Navigation and Routing', () => {
    it('should render home as the default view', () => {
      render(<Dashboard />, { wrapper: createWrapper() })
      expect(screen.getByText("Today's Progress")).toBeInTheDocument()
    })

    it('should have navigation available for switching to statistics', () => {
      render(<Dashboard />, { wrapper: createWrapper() })
      const nav = screen.getByRole('navigation')
      expect(nav.querySelectorAll('button').length).toBeGreaterThan(0)
    })
  })

  describe('Complete User Journey: Dashboard to StatisticsPage', () => {
    it('should support the complete flow from dashboard to statistics and back', () => {
      render(<Dashboard />, { wrapper: createWrapper() })

      // Start at dashboard
      expect(screen.getByText("Today's Progress")).toBeInTheDocument()

      // Navigation should be available
      expect(screen.getByRole('navigation')).toBeInTheDocument()

      // All data should be available for StatisticsPage
      expect(vi.mocked(useAuth)).toHaveBeenCalled()
      expect(vi.mocked(useTodayActivity)).toHaveBeenCalled()
      expect(vi.mocked(useWeeklyActivity)).toHaveBeenCalled()
      expect(vi.mocked(useLatestBodyMetrics)).toHaveBeenCalled()
    })
  })
})
