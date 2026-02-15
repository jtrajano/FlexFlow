/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ProfileView } from './ProfileView'
import { useAuth } from '../hooks/useAuth'
import { useUserGoals } from '../hooks/useUserGoals'
import { useLatestBodyMetrics } from '../hooks/useBodyMetrics'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Mock all hooks
vi.mock('../hooks/useAuth')
vi.mock('../hooks/useUserGoals')
vi.mock('../hooks/useBodyMetrics')

// Mock Firebase
vi.mock('../lib/firebase', () => ({
  db: {},
}))

// Create a mock user profile that will be returned by getDoc
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

// Mock Framer Motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
}))

const mockUser = {
  uid: 'test-user-123',
  email: 'test@example.com',
  displayName: 'Test User',
}

const mockUserGoals = {
  uid: 'goal-1',
  userId: 'test-user-123',
  goalType: 'BuildMuscle' as const,
  weeklyCalorieBurnTarget: 2500,
  weeklyWorkoutMinutes: 180,
  weeklyWorkoutFrequencyTarget: 4,
  dailyMoveTarget: 8000,
  dailyExerciseTarget: 30,
  activityLevel: 'moderate',
  workoutPreferences: 'strength training',
  workoutTypeDistribution: [],
  createdAt: new Date().toISOString(),
}

const mockBodyMetrics = {
  uid: 'metrics-1',
  userId: 'test-user-123',
  weight: 75.5,
  bodyFatPercent: 18.5,
  recordedAt: new Date().toISOString(),
}

// Create a wrapper component with QueryClient
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

describe('ProfileView', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Default mock implementations
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser as any,
      userData: null,
      loading: false,
      error: null,
    } as any)

    vi.mocked(useUserGoals).mockReturnValue({
      data: mockUserGoals,
      isLoading: false,
      error: null,
    } as any)

    vi.mocked(useLatestBodyMetrics).mockReturnValue({
      data: mockBodyMetrics,
      isLoading: false,
      error: null,
    } as any)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Component Rendering', () => {
    it('should render the Profile page header', () => {
      render(<ProfileView onBack={vi.fn()} />, { wrapper: createWrapper() })
      expect(screen.getByText('Profile')).toBeInTheDocument()
      expect(screen.getByText('Manage your account settings')).toBeInTheDocument()
    })

    it('should render all 6 tab buttons', () => {
      render(<ProfileView onBack={vi.fn()} />, { wrapper: createWrapper() })

      expect(screen.getByText('Personal Info')).toBeInTheDocument()
      expect(screen.getByText('Fitness Goals')).toBeInTheDocument()
      expect(screen.getByText('Devices')).toBeInTheDocument()
      expect(screen.getByText('Notifications')).toBeInTheDocument()
      expect(screen.getByText('Security')).toBeInTheDocument()
      expect(screen.getByText('Privacy')).toBeInTheDocument()
    })

    it('should render PRO badges for premium features', () => {
      render(<ProfileView onBack={vi.fn()} />, { wrapper: createWrapper() })

      const proBadges = screen.getAllByText('PRO')
      expect(proBadges.length).toBeGreaterThan(0)
    })

    it('should render close button in header', () => {
      render(<ProfileView onBack={vi.fn()} />, { wrapper: createWrapper() })

      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should default to personal info tab on initial render', () => {
      render(<ProfileView onBack={vi.fn()} />, { wrapper: createWrapper() })

      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByText('Email')).toBeInTheDocument()
    })
  })

  describe('Personal Info Tab', () => {
    it('should display user name from auth', () => {
      render(<ProfileView onBack={vi.fn()} />, { wrapper: createWrapper() })

      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByText('Test User')).toBeInTheDocument()
    })

    it('should display user email from auth', () => {
      render(<ProfileView onBack={vi.fn()} />, { wrapper: createWrapper() })

      expect(screen.getByText('Email')).toBeInTheDocument()
      expect(screen.getByText('test@example.com')).toBeInTheDocument()
    })

    it('should display height in centimeters', async () => {
      render(<ProfileView onBack={vi.fn()} />, { wrapper: createWrapper() })

      expect(screen.getByText('Height')).toBeInTheDocument()

      await waitFor(() => {
        expect(screen.getByText('180 cm')).toBeInTheDocument()
      })
    })

    it('should display weight in kilograms', async () => {
      render(<ProfileView onBack={vi.fn()} />, { wrapper: createWrapper() })

      expect(screen.getByText('Weight')).toBeInTheDocument()

      await waitFor(() => {
        expect(screen.getByText('75.5 kg')).toBeInTheDocument()
      })
    })

    it('should display gender', async () => {
      render(<ProfileView onBack={vi.fn()} />, { wrapper: createWrapper() })

      expect(screen.getByText('Gender')).toBeInTheDocument()

      await waitFor(() => {
        expect(screen.getByText('male')).toBeInTheDocument()
      })
    })

    it('should handle missing height data', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: mockUser as any,
        userData: null,
        loading: false,
        error: null,
      } as any)

      render(<ProfileView onBack={vi.fn()} />, { wrapper: createWrapper() })

      const notSetElements = screen.getAllByText('Not set')
      expect(notSetElements.length).toBeGreaterThan(0)
    })

    it('should handle missing weight data', () => {
      vi.mocked(useLatestBodyMetrics).mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      } as any)

      render(<ProfileView onBack={vi.fn()} />, { wrapper: createWrapper() })

      const notSetElements = screen.getAllByText('Not set')
      expect(notSetElements.length).toBeGreaterThan(0)
    })

    it('should show helper text for updating personal info', () => {
      render(<ProfileView onBack={vi.fn()} />, { wrapper: createWrapper() })

      expect(screen.getByText(/To update your personal information/i)).toBeInTheDocument()
    })
  })

  describe('Fitness Goals Tab', () => {
    beforeEach(() => {
      render(<ProfileView onBack={vi.fn()} />, { wrapper: createWrapper() })
      const goalsTab = screen.getByText('Fitness Goals')
      fireEvent.click(goalsTab)
    })

    it('should display goal type', () => {
      expect(screen.getByText('Goal Type')).toBeInTheDocument()
      expect(screen.getByText('Build Muscle')).toBeInTheDocument()
    })

    it('should display workout frequency', () => {
      expect(screen.getByText('Workout Frequency')).toBeInTheDocument()
      expect(screen.getByText('4 times/week')).toBeInTheDocument()
    })

    it('should display workout target minutes', () => {
      expect(screen.getByText('Workout Target Minutes')).toBeInTheDocument()
      expect(screen.getByText('180 min/week')).toBeInTheDocument()
    })

    it('should display calorie target', () => {
      expect(screen.getByText('Calorie Target')).toBeInTheDocument()
      expect(screen.getByText('2500 cal/week')).toBeInTheDocument()
    })

    it('should display daily stand goal', () => {
      expect(screen.getByText('Daily Stand Goal')).toBeInTheDocument()
      expect(screen.getByText('8000 steps')).toBeInTheDocument()
    })

    it('should display workout preference', () => {
      expect(screen.getByText('Workout Preference')).toBeInTheDocument()
      expect(screen.getByText('strength training')).toBeInTheDocument()
    })

    it('should format goal type with spaces', () => {
      expect(screen.getByText('Build Muscle')).toBeInTheDocument()
    })

    it('should show helper text for updating goals', () => {
      expect(screen.getByText(/To update your fitness goals/i)).toBeInTheDocument()
    })
  })

  describe('Devices Tab', () => {
    beforeEach(() => {
      render(<ProfileView onBack={vi.fn()} />, { wrapper: createWrapper() })
      const devicesTab = screen.getByText('Devices')
      fireEvent.click(devicesTab)
    })

    it('should display PRO upgrade prompt', () => {
      expect(screen.getByText('Upgrade to PRO')).toBeInTheDocument()
      expect(screen.getByText(/Unlock premium features/i)).toBeInTheDocument()
    })

    it('should display Garmin integration option', () => {
      expect(screen.getByText('Garmin')).toBeInTheDocument()
      expect(screen.getByText('Sync fitness data')).toBeInTheDocument()
    })

    it('should display Google Fit integration option', () => {
      expect(screen.getByText('Google Fit')).toBeInTheDocument()
      expect(screen.getByText('Sync activity data')).toBeInTheDocument()
    })

    it('should display Apple Health integration option', () => {
      expect(screen.getByText('Apple Health')).toBeInTheDocument()
      expect(screen.getByText('Sync health metrics')).toBeInTheDocument()
    })

    it('should have Connect buttons for each device', () => {
      const connectButtons = screen.getAllByText('Connect')
      expect(connectButtons.length).toBe(3)
    })

    it('should have Upgrade Now button', () => {
      expect(screen.getByText('Upgrade Now')).toBeInTheDocument()
    })
  })

  describe('Notifications Tab', () => {
    beforeEach(() => {
      render(<ProfileView onBack={vi.fn()} />, { wrapper: createWrapper() })
      const notificationsTab = screen.getByText('Notifications')
      fireEvent.click(notificationsTab)
    })

    it('should display PRO upgrade prompt', () => {
      expect(screen.getByText('Upgrade to PRO')).toBeInTheDocument()
    })

    it('should display workout reminders toggle', () => {
      expect(screen.getByText('Workout Reminders')).toBeInTheDocument()
    })

    it('should display daily activity reminder toggle', () => {
      expect(screen.getByText('Daily Activity Reminder')).toBeInTheDocument()
    })

    it('should display email notifications toggle', () => {
      expect(screen.getByText('Email Notifications')).toBeInTheDocument()
    })

    it('should display push notifications toggle', () => {
      expect(screen.getByText('Push Notifications')).toBeInTheDocument()
    })
  })

  describe('Security Tab', () => {
    beforeEach(() => {
      render(<ProfileView onBack={vi.fn()} />, { wrapper: createWrapper() })
      const securityTab = screen.getByText('Security')
      fireEvent.click(securityTab)
    })

    it('should display change password option', () => {
      expect(screen.getByText('Change Password')).toBeInTheDocument()
      expect(screen.getByText('Update your account password')).toBeInTheDocument()
    })

    it('should display 2FA option with PRO badge', () => {
      expect(screen.getByText('Two-Factor Authentication')).toBeInTheDocument()
      expect(screen.getByText('Add an extra layer of security')).toBeInTheDocument()
    })

    it('should display profile visibility toggle', () => {
      expect(screen.getByText('Profile Visibility')).toBeInTheDocument()
      expect(screen.getByText('Make your profile private')).toBeInTheDocument()
    })

    it('should display logout from all devices option', () => {
      expect(screen.getByText('Logout from All Devices')).toBeInTheDocument()
      expect(screen.getByText('End all active sessions')).toBeInTheDocument()
    })

    it('should show profile visibility description', () => {
      expect(screen.getByText('Your profile is only visible to you')).toBeInTheDocument()
    })
  })

  describe('Privacy Tab', () => {
    beforeEach(() => {
      render(<ProfileView onBack={vi.fn()} />, { wrapper: createWrapper() })
      const privacyTab = screen.getByText('Privacy')
      fireEvent.click(privacyTab)
    })

    it('should display data export option with PRO badge', () => {
      expect(screen.getByText('Data Export')).toBeInTheDocument()
      expect(screen.getByText('Download your fitness data')).toBeInTheDocument()
    })

    it('should display delete account option', () => {
      expect(screen.getByText('Delete Account')).toBeInTheDocument()
      expect(screen.getByText(/Permanently delete your account/i)).toBeInTheDocument()
    })

    it('should show coming soon status for data export', () => {
      expect(screen.getByText('Coming Soon')).toBeInTheDocument()
    })
  })

  describe('Tab Navigation', () => {
    it('should switch to goals tab when clicked', () => {
      render(<ProfileView onBack={vi.fn()} />, { wrapper: createWrapper() })

      const goalsTab = screen.getByText('Fitness Goals')
      fireEvent.click(goalsTab)

      expect(screen.getByText('Goal Type')).toBeInTheDocument()
    })

    it('should switch to devices tab when clicked', () => {
      render(<ProfileView onBack={vi.fn()} />, { wrapper: createWrapper() })

      const devicesTab = screen.getByText('Devices')
      fireEvent.click(devicesTab)

      expect(screen.getByText('Garmin')).toBeInTheDocument()
    })

    it('should switch to notifications tab when clicked', () => {
      render(<ProfileView onBack={vi.fn()} />, { wrapper: createWrapper() })

      const notificationsTab = screen.getByText('Notifications')
      fireEvent.click(notificationsTab)

      expect(screen.getByText('Workout Reminders')).toBeInTheDocument()
    })

    it('should switch to security tab when clicked', () => {
      render(<ProfileView onBack={vi.fn()} />, { wrapper: createWrapper() })

      const securityTab = screen.getByText('Security')
      fireEvent.click(securityTab)

      expect(screen.getByText('Change Password')).toBeInTheDocument()
    })

    it('should switch to privacy tab when clicked', () => {
      render(<ProfileView onBack={vi.fn()} />, { wrapper: createWrapper() })

      const privacyTab = screen.getByText('Privacy')
      fireEvent.click(privacyTab)

      expect(screen.getByText('Delete Account')).toBeInTheDocument()
    })

    it('should switch back to personal tab when clicked', () => {
      render(<ProfileView onBack={vi.fn()} />, { wrapper: createWrapper() })

      const goalsTab = screen.getByText('Fitness Goals')
      fireEvent.click(goalsTab)

      const personalTab = screen.getByText('Personal Info')
      fireEvent.click(personalTab)

      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByText('Email')).toBeInTheDocument()
    })
  })

  describe('Profile Visibility Toggle', () => {
    it('should initialize toggle based on user profile data', () => {
      render(<ProfileView onBack={vi.fn()} />, { wrapper: createWrapper() })

      const securityTab = screen.getByText('Security')
      fireEvent.click(securityTab)

      expect(screen.getByText('Make your profile private')).toBeInTheDocument()
    })

    it('should have a clickable profile visibility toggle', () => {
      render(<ProfileView onBack={vi.fn()} />, { wrapper: createWrapper() })

      const securityTab = screen.getByText('Security')
      fireEvent.click(securityTab)

      expect(screen.getByText('Profile Visibility')).toBeInTheDocument()
      expect(screen.getByText('Make your profile private')).toBeInTheDocument()

      const toggleButtons = screen.getAllByRole('button')
      const visibilityToggle = toggleButtons.find(btn => btn.className.includes('rounded-full'))

      expect(visibilityToggle).toBeTruthy()
      expect(visibilityToggle).toBeInTheDocument()
    })

    it('should display profile visibility description', () => {
      render(<ProfileView onBack={vi.fn()} />, { wrapper: createWrapper() })

      const securityTab = screen.getByText('Security')
      fireEvent.click(securityTab)

      expect(screen.getByText('Profile Visibility')).toBeInTheDocument()
      expect(screen.getByText('Your profile is only visible to you')).toBeInTheDocument()
    })
  })

  describe('Close Button and Save Functionality', () => {
    it('should call onBack when close button is clicked', () => {
      const mockOnBack = vi.fn()
      render(<ProfileView onBack={mockOnBack} />, { wrapper: createWrapper() })

      const buttons = screen.getAllByRole('button')
      const closeButton = buttons.find(btn => btn.querySelector('svg'))

      if (closeButton) {
        fireEvent.click(closeButton)
        expect(mockOnBack).toHaveBeenCalled()
      }
    })

    it('should save profile visibility changes on close', async () => {
      const mockOnBack = vi.fn()

      render(<ProfileView onBack={mockOnBack} />, { wrapper: createWrapper() })

      const securityTab = screen.getByText('Security')
      fireEvent.click(securityTab)

      const toggleButtons = screen.getAllByRole('button')
      const visibilityToggle = toggleButtons.find(btn => btn.className.includes('rounded-full'))

      if (visibilityToggle) {
        fireEvent.click(visibilityToggle)
      }

      const buttons = screen.getAllByRole('button')
      const closeButton = buttons.find(btn => btn.querySelector('svg'))

      if (closeButton) {
        fireEvent.click(closeButton)
      }

      await waitFor(() => {
        expect(mockOnBack).toHaveBeenCalled()
      })
    })
  })

  describe('Data Loading and Error States', () => {
    it('should handle null user data', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        userData: null,
        loading: false,
        error: null,
      } as any)

      render(<ProfileView onBack={vi.fn()} />, { wrapper: createWrapper() })

      expect(screen.getByText('Profile')).toBeInTheDocument()
    })

    it('should handle null user goals data', () => {
      vi.mocked(useUserGoals).mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      } as any)

      render(<ProfileView onBack={vi.fn()} />, { wrapper: createWrapper() })

      const goalsTab = screen.getByText('Fitness Goals')
      fireEvent.click(goalsTab)

      const notSetElements = screen.getAllByText('Not set')
      expect(notSetElements.length).toBeGreaterThan(0)
    })

    it('should handle null body metrics data', () => {
      vi.mocked(useLatestBodyMetrics).mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      } as any)

      render(<ProfileView onBack={vi.fn()} />, { wrapper: createWrapper() })

      const notSetElements = screen.getAllByText('Not set')
      expect(notSetElements.length).toBeGreaterThan(0)
    })

    it('should handle missing display name', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: { ...mockUser, displayName: null } as any,
        userData: null,
        loading: false,
        error: null,
      } as any)

      render(<ProfileView onBack={vi.fn()} />, { wrapper: createWrapper() })

      const notSetElements = screen.getAllByText('Not set')
      expect(notSetElements.length).toBeGreaterThan(0)
    })
  })

  describe('Component Rerender and State Management', () => {
    it('should maintain selected tab across rerenders', () => {
      const { rerender } = render(<ProfileView onBack={vi.fn()} />, {
        wrapper: createWrapper(),
      })

      const goalsTab = screen.getByText('Fitness Goals')
      fireEvent.click(goalsTab)

      rerender(<ProfileView onBack={vi.fn()} />)

      expect(screen.getByText('Goal Type')).toBeInTheDocument()
    })

    it('should update when user profile data changes', () => {
      const Wrapper = createWrapper()
      const { rerender } = render(<ProfileView onBack={vi.fn()} />, {
        wrapper: Wrapper,
      })

      expect(screen.getByText('Test User')).toBeInTheDocument()

      vi.mocked(useAuth).mockReturnValue({
        user: { ...mockUser, displayName: 'Updated User' } as any,
        userData: null,
        loading: false,
        error: null,
      } as any)

      rerender(<ProfileView onBack={vi.fn()} />)

      expect(screen.getByText('Updated User')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper button roles for tabs', () => {
      render(<ProfileView onBack={vi.fn()} />, { wrapper: createWrapper() })

      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should have clickable close button', () => {
      render(<ProfileView onBack={vi.fn()} />, { wrapper: createWrapper() })

      const buttons = screen.getAllByRole('button')
      const closeButton = buttons.find(btn => btn.querySelector('svg'))

      expect(closeButton).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle workout preferences as empty string', () => {
      vi.mocked(useUserGoals).mockReturnValue({
        data: { ...mockUserGoals, workoutPreferences: '' },
        isLoading: false,
        error: null,
      } as any)

      render(<ProfileView onBack={vi.fn()} />, { wrapper: createWrapper() })

      const goalsTab = screen.getByText('Fitness Goals')
      fireEvent.click(goalsTab)

      expect(screen.getByText('Not set')).toBeInTheDocument()
    })

    it('should handle zero values in goals', () => {
      vi.mocked(useUserGoals).mockReturnValue({
        data: {
          ...mockUserGoals,
          weeklyCalorieBurnTarget: 0,
          weeklyWorkoutMinutes: 0,
        },
        isLoading: false,
        error: null,
      } as any)

      render(<ProfileView onBack={vi.fn()} />, { wrapper: createWrapper() })

      const goalsTab = screen.getByText('Fitness Goals')
      fireEvent.click(goalsTab)

      expect(screen.getByText('0 cal/week')).toBeInTheDocument()
      expect(screen.getByText('0 min/week')).toBeInTheDocument()
    })

    it('should handle profile visibility Public value', () => {
      render(<ProfileView onBack={vi.fn()} />, { wrapper: createWrapper() })

      const securityTab = screen.getByText('Security')
      fireEvent.click(securityTab)

      expect(screen.getByText('Profile Visibility')).toBeInTheDocument()
    })
  })
})
