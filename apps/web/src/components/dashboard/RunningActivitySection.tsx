import { useMemo, useState, useEffect } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { useQueryClient } from '@tanstack/react-query'
import { calculateActivityCalories } from '@repo/shared'
import { useAuth } from '../../hooks/useAuth'
import { useRunningActivity } from '../../hooks/useRunningActivity'
import { useLatestBodyMetrics } from '../../hooks/useBodyMetrics'
import { getActivityDurationMinutes } from '../../utils/activity-log'
import { db } from '../../lib/firebase'

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
      const computedMinutes = getActivityDurationMinutes(runningActivity, endTime)
      const durationMinutes = Math.max(1, computedMinutes)
      const caloriesBurned = calculateActivityCalories(
        runningActivity.type,
        durationMinutes,
        metrics?.weight || 70
      )

      await updateDoc(doc(db, 'activityLogs', runningActivity.uid), {
        status: 'completed',
        endTime: endTime.toISOString(),
        durationMinutes,
        caloriesBurned,
      })

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['activityLogs', 'today', user.uid] }),
        queryClient.invalidateQueries({ queryKey: ['activityLogs', 'weekly', user.uid] }),
        queryClient.invalidateQueries({ queryKey: ['activityLogs', 'running', user.uid] }),
      ])
    } catch (error) {
      console.error('Error stopping activity:', error)
      alert('Failed to stop activity')
    } finally {
      setIsStopping(false)
    }
  }

  if (isLoading || !runningActivity) return null

  if (embedded) {
    return (
      <div className={`min-w-[220px] rounded-xl bg-black/30 p-4 text-right ${className || ''}`}>
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#a3e635]">
          Activity In Progress
        </p>
        <h3 className="mt-1 text-lg font-black text-white capitalize">{runningActivity.type}</h3>
        <p className="mt-1 font-mono text-2xl font-black text-white">{elapsed}</p>
        <div className="mt-3 flex justify-end">
          <button
            onClick={handleStop}
            disabled={isStopping}
            className="rounded-lg bg-red-500 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-red-400 disabled:opacity-60"
          >
            {isStopping ? 'Stopping...' : 'Stop'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`mb-8 rounded-2xl bg-gradient-to-r from-[#a3e635]/15 to-[#84cc16]/5 p-5 ${className || ''}`}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#a3e635]">
            Activity In Progress
          </p>
          <h3 className="mt-1 text-xl font-black text-white capitalize">{runningActivity.type}</h3>
          <p className="mt-2 font-mono text-2xl font-black text-white">{elapsed}</p>
        </div>

        <button
          onClick={handleStop}
          disabled={isStopping}
          className="rounded-xl bg-red-500 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-red-400 disabled:opacity-60"
        >
          {isStopping ? 'Stopping...' : 'Stop'}
        </button>
      </div>
    </div>
  )
}
