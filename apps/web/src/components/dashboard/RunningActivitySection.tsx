import { useMemo, useState, useEffect } from 'react'
import { deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { useQueryClient } from '@tanstack/react-query'
import { calculateActivityCalories, ActivityLog } from '@repo/shared'
import { useAuth } from '../../hooks/useAuth'
import { useRunningActivity } from '../../hooks/useRunningActivity'
import { useLatestBodyMetrics } from '../../hooks/useBodyMetrics'
import { getActivityDurationMinutes } from '../../utils/activity-log'
import { db } from '../../lib/firebase'
import { WorkoutCompletedModal } from './WorkoutCompletedModal'

interface RunningActivitySectionProps {
  className?: string
  embedded?: boolean
}

function formatElapsedTime(startTime: string | undefined, nowMs: number): string {
  if (!startTime) return '00:00:00'
  const startMs = new Date(startTime).getTime()
  if (Number.isNaN(startMs)) return '00:00:00'

  const totalSeconds = Math.max(0, Math.floor((nowMs - startMs) / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const hh = String(hours).padStart(2, '0')
  const mm = String(minutes).padStart(2, '0')
  const ss = String(seconds).padStart(2, '0')
  return `${hh}:${mm}:${ss}`
}

export function RunningActivitySection({
  className,
  embedded = false,
}: RunningActivitySectionProps) {
  const { user } = useAuth()
  const { data: runningActivity, isLoading } = useRunningActivity(user?.uid)
  const { data: metrics } = useLatestBodyMetrics(user?.uid)
  const queryClient = useQueryClient()
  const [nowMs, setNowMs] = useState(() => Date.now())
  const [isStopping, setIsStopping] = useState(false)
  const [isDiscarding, setIsDiscarding] = useState(false)
  const [completedActivity, setCompletedActivity] = useState<ActivityLog | null>(null)
  const [showCompletedModal, setShowCompletedModal] = useState(false)

  useEffect(() => {
    if (!runningActivity) return
    const interval = setInterval(() => setNowMs(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [runningActivity])

  const startTime = runningActivity?.startTime || runningActivity?.timestamp
  const elapsed = useMemo(() => formatElapsedTime(startTime, nowMs), [startTime, nowMs])

  const handleStop = async () => {
    if (!user || !runningActivity?.uid) return

    setIsStopping(true)
    try {
      const endTime = new Date()
      // Get precise duration in minutes (can be decimal)
      const preciseMinutes = getActivityDurationMinutes(runningActivity, endTime)
      // Calculate calories with precise minutes for accuracy
      const caloriesBurned = calculateActivityCalories(
        runningActivity.type,
        preciseMinutes,
        metrics?.weight || 70
      )
      // Round to whole minutes for storage (ensure at least 1 minute)
      const durationMinutes = Math.max(1, Math.round(preciseMinutes))

      await updateDoc(doc(db, 'activityLogs', runningActivity.uid), {
        status: 'completed',
        endTime: endTime.toISOString(),
        durationMinutes,
        caloriesBurned,
      })

      // Invalidate today and weekly queries immediately, but not running query yet
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['activityLogs', 'today', user.uid] }),
        queryClient.invalidateQueries({ queryKey: ['activityLogs', 'weekly', user.uid] }),
      ])

      // Show completed modal with the updated activity data
      const completedActivityData: ActivityLog = {
        ...runningActivity,
        status: 'completed',
        endTime: endTime.toISOString(),
        durationMinutes,
        caloriesBurned,
      }
      setCompletedActivity(completedActivityData)
      setShowCompletedModal(true)
    } catch (error) {
      console.error('Error stopping activity:', error)
      alert('Failed to stop activity')
    } finally {
      setIsStopping(false)
    }
  }

  const handleDiscard = async () => {
    if (!user || !runningActivity?.uid) return
    const shouldDiscard = window.confirm('Discard this in-progress activity?')
    if (!shouldDiscard) return

    setIsDiscarding(true)
    try {
      await deleteDoc(doc(db, 'activityLogs', runningActivity.uid))
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['activityLogs', 'today', user.uid] }),
        queryClient.invalidateQueries({ queryKey: ['activityLogs', 'weekly', user.uid] }),
        queryClient.invalidateQueries({ queryKey: ['activityLogs', 'running', user.uid] }),
      ])
    } catch (error) {
      console.error('Error discarding activity:', error)
      alert('Failed to discard activity')
    } finally {
      setIsDiscarding(false)
    }
  }

  // Don't unmount if we're showing the completed modal
  if (isLoading || (!runningActivity && !showCompletedModal)) return null

  // If no running activity but showing completed modal, only show the modal
  if (!runningActivity && showCompletedModal && completedActivity) {
    return (
      <WorkoutCompletedModal
        isOpen={showCompletedModal}
        onClose={() => {
          setShowCompletedModal(false)
          setCompletedActivity(null)
          // Invalidate running query only after modal is closed
          if (user) {
            queryClient.invalidateQueries({ queryKey: ['activityLogs', 'running', user.uid] })
          }
        }}
        activity={completedActivity}
      />
    )
  }

  // At this point, runningActivity must exist
  if (!runningActivity) return null

  if (embedded) {
    return (
      <>
        <div className={`min-w-[220px] rounded-xl bg-black/30 p-4 text-right ${className || ''}`}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#a3e635]">
            Activity In Progress
          </p>
          <h3 className="mt-1 text-lg font-black text-white capitalize">{runningActivity.type}</h3>
          <p className="mt-1 font-mono text-2xl font-black text-white">{elapsed}</p>
          <div className="mt-3 flex justify-end gap-2">
            <button
              onClick={handleDiscard}
              disabled={isStopping || isDiscarding}
              className="rounded-lg bg-white/10 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-white/20 disabled:opacity-60"
            >
              {isDiscarding ? 'Discarding...' : 'Discard'}
            </button>
            <button
              onClick={handleStop}
              disabled={isStopping || isDiscarding}
              className="rounded-lg bg-red-500 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-red-400 disabled:opacity-60"
            >
              {isStopping ? 'Stopping...' : 'Stop'}
            </button>
          </div>
        </div>

        {completedActivity && (
          <WorkoutCompletedModal
            isOpen={showCompletedModal}
            onClose={() => {
              setShowCompletedModal(false)
              setCompletedActivity(null)
              // Invalidate running query only after modal is closed
              if (user) {
                queryClient.invalidateQueries({ queryKey: ['activityLogs', 'running', user.uid] })
              }
            }}
            activity={completedActivity}
          />
        )}
      </>
    )
  }

  return (
    <>
      <div
        className={`mb-8 rounded-2xl bg-gradient-to-r from-[#a3e635]/15 to-[#84cc16]/5 p-5 ${className || ''}`}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#a3e635]">
              Activity In Progress
            </p>
            <h3 className="mt-1 text-xl font-black text-white capitalize">
              {runningActivity.type}
            </h3>
            <p className="mt-2 font-mono text-2xl font-black text-white">{elapsed}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDiscard}
              disabled={isStopping || isDiscarding}
              className="rounded-xl bg-white/10 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-white/20 disabled:opacity-60"
            >
              {isDiscarding ? 'Discarding...' : 'Discard'}
            </button>
            <button
              onClick={handleStop}
              disabled={isStopping || isDiscarding}
              className="rounded-xl bg-red-500 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-red-400 disabled:opacity-60"
            >
              {isStopping ? 'Stopping...' : 'Stop'}
            </button>
          </div>
        </div>
      </div>

      {completedActivity && (
        <WorkoutCompletedModal
          isOpen={showCompletedModal}
          onClose={() => {
            setShowCompletedModal(false)
            setCompletedActivity(null)
            // Invalidate running query only after modal is closed
            if (user) {
              queryClient.invalidateQueries({ queryKey: ['activityLogs', 'running', user.uid] })
            }
          }}
          activity={completedActivity}
        />
      )}
    </>
  )
}
