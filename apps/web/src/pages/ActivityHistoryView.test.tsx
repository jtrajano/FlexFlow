/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { ActivityHistoryView } from './ActivityHistoryView'
import { useAuth } from '../hooks/useAuth'
import { useActivityHistory } from '../hooks/useActivityHistory'

vi.mock('../hooks/useAuth')
vi.mock('../hooks/useActivityHistory')

const mockUser = {
  uid: 'user-1',
  displayName: 'Test User',
}

const mockActivities = [
  {
    uid: 'a6',
    userId: 'user-1',
    type: 'sports',
    durationMinutes: 36,
    caloriesBurned: 106,
    timestamp: '2026-02-12T10:06:00.000Z',
    startTime: '2026-02-12T10:06:00.000Z',
    endTime: '2026-02-12T10:42:00.000Z',
    date: '2026-02-12',
    status: 'completed',
  },
  {
    uid: 'a5',
    userId: 'user-1',
    type: 'swimming',
    durationMinutes: 35,
    caloriesBurned: 105,
    timestamp: '2026-02-12T09:05:00.000Z',
    startTime: '2026-02-12T09:05:00.000Z',
    endTime: '2026-02-12T09:40:00.000Z',
    date: '2026-02-12',
    status: 'completed',
  },
  {
    uid: 'a4',
    userId: 'user-1',
    type: 'hiit',
    durationMinutes: 34,
    caloriesBurned: 104,
    timestamp: '2026-02-12T08:04:00.000Z',
    startTime: '2026-02-12T08:04:00.000Z',
    endTime: '2026-02-12T08:38:00.000Z',
    date: '2026-02-12',
    status: 'completed',
  },
  {
    uid: 'a3',
    userId: 'user-1',
    type: 'yoga',
    durationMinutes: 33,
    caloriesBurned: 103,
    timestamp: '2026-02-12T07:03:00.000Z',
    startTime: '2026-02-12T07:03:00.000Z',
    endTime: '2026-02-12T07:36:00.000Z',
    date: '2026-02-12',
    status: 'completed',
  },
  {
    uid: 'a2',
    userId: 'user-1',
    type: 'strength',
    durationMinutes: 32,
    caloriesBurned: 102,
    timestamp: '2026-02-12T06:02:00.000Z',
    startTime: '2026-02-12T06:02:00.000Z',
    endTime: '2026-02-12T06:34:00.000Z',
    date: '2026-02-12',
    status: 'completed',
  },
  {
    uid: 'a1',
    userId: 'user-1',
    type: 'cardio',
    durationMinutes: 31,
    caloriesBurned: 101,
    timestamp: '2026-02-12T05:01:00.000Z',
    startTime: '2026-02-12T05:01:00.000Z',
    endTime: '2026-02-12T05:32:00.000Z',
    date: '2026-02-12',
    status: 'completed',
  },
] as any[]

describe('ActivityHistoryView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser as any,
      userData: null,
      loading: false,
      error: null,
    } as any)
  })

  it('renders loading state', () => {
    vi.mocked(useActivityHistory).mockReturnValue({
      data: [],
      isLoading: true,
      error: null,
    } as any)

    render(<ActivityHistoryView onBack={vi.fn()} />)
    expect(screen.getByText('Activity History')).toBeInTheDocument()
    expect(screen.getByText('Latest activity appears first')).toBeInTheDocument()
  })

  it('renders empty state', () => {
    vi.mocked(useActivityHistory).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any)

    render(<ActivityHistoryView onBack={vi.fn()} />)
    expect(screen.getByText('No activity logs yet.')).toBeInTheDocument()
  })

  it('shows latest activity first and paginates to 5 per page', () => {
    vi.mocked(useActivityHistory).mockReturnValue({
      data: mockActivities,
      isLoading: false,
      error: null,
    } as any)

    render(<ActivityHistoryView onBack={vi.fn()} />)

    // First page should include first 5 entries, newest on top
    expect(screen.getByText('sports')).toBeInTheDocument()
    expect(screen.getByText('swimming')).toBeInTheDocument()
    expect(screen.getByText('hiit')).toBeInTheDocument()
    expect(screen.getByText('yoga')).toBeInTheDocument()
    expect(screen.getByText('strength')).toBeInTheDocument()
    expect(screen.queryByText('cardio')).not.toBeInTheDocument()

    // Pagination controls visible
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument()
    const nextButton = screen.getByRole('button', { name: 'Next' })
    fireEvent.click(nextButton)

    // Second page should show only the 6th item
    expect(screen.getByText('Page 2 of 2')).toBeInTheDocument()
    expect(screen.getByText('cardio')).toBeInTheDocument()
    expect(screen.queryByText('sports')).not.toBeInTheDocument()
  })
})
