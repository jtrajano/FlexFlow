/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { WorkoutCompletedModal } from './WorkoutCompletedModal'

const { mockUpdateDoc, mockDoc } = vi.hoisted(() => ({
  mockUpdateDoc: vi.fn(),
  mockDoc: vi.fn(() => ({ id: 'activity-1-ref' })),
}))

vi.mock('../lib/firebase', () => ({
  db: {},
}))

vi.mock('firebase/firestore', () => ({
  doc: mockDoc,
  updateDoc: mockUpdateDoc,
}))

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

const mockActivity = {
  uid: 'activity-1',
  userId: 'user-1',
  type: 'cardio',
  durationMinutes: 45,
  caloriesBurned: 360,
  timestamp: '2026-02-12T12:00:00.000Z',
  date: '2026-02-12',
  status: 'completed',
} as any

describe('WorkoutCompletedModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders summary content when open', () => {
    render(<WorkoutCompletedModal isOpen onClose={vi.fn()} activity={mockActivity} />)

    expect(screen.getByText('Workout Complete!')).toBeInTheDocument()
    expect(screen.getByText('Share Workout')).toBeInTheDocument()
    expect(screen.getByText('Done')).toBeInTheDocument()
    expect(screen.getByText('cardio')).toBeInTheDocument()
    expect(screen.getByText('360')).toBeInTheDocument()
  })

  it('saves notes and difficulty on Done', async () => {
    const onClose = vi.fn()
    mockUpdateDoc.mockResolvedValue(undefined)

    render(<WorkoutCompletedModal isOpen onClose={onClose} activity={mockActivity} />)

    fireEvent.click(screen.getByRole('button', { name: /medium/i }))
    fireEvent.change(screen.getByPlaceholderText(/How did you feel/i), {
      target: { value: 'Felt strong today' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Done' }))

    await waitFor(() => {
      expect(mockDoc).toHaveBeenCalled()
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        { id: 'activity-1-ref' },
        {
          notes: 'Felt strong today',
          difficulty: 'medium',
        }
      )
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  it('uses native share when available', () => {
    const shareMock = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', {
      ...navigator,
      share: shareMock,
    })

    render(<WorkoutCompletedModal isOpen onClose={vi.fn()} activity={mockActivity} />)
    fireEvent.click(screen.getByRole('button', { name: /Share Workout/i }))

    expect(shareMock).toHaveBeenCalledTimes(1)
    expect(shareMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Workout Complete!',
      })
    )
  })

  it('falls back to clipboard when share is unavailable', () => {
    const writeTextMock = vi.fn()
    const alertMock = vi.fn()
    vi.stubGlobal('alert', alertMock)
    vi.stubGlobal('navigator', {
      ...navigator,
      clipboard: { writeText: writeTextMock },
      share: undefined,
    })

    render(<WorkoutCompletedModal isOpen onClose={vi.fn()} activity={mockActivity} />)
    fireEvent.click(screen.getByRole('button', { name: /Share Workout/i }))

    expect(writeTextMock).toHaveBeenCalledTimes(1)
    expect(alertMock).toHaveBeenCalledWith('Workout summary copied to clipboard!')
  })
})
