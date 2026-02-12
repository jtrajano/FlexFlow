import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useActivityHistory } from '../../hooks/useActivityHistory'
import { getActivityDurationMinutes, getActivityStatus } from '../../utils/activity-log'

function formatDateTime(value?: string): string {
  if (!value) return '-'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return '-'
  return parsed.toLocaleString()
}

export function ActivityHistoryView({ onBack }: { onBack: () => void }) {
  const { user } = useAuth()
  const { data: activities = [], isLoading } = useActivityHistory(user?.uid)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 5

  const totalPages = Math.max(1, Math.ceil(activities.length / pageSize))

  useEffect(() => {
    setCurrentPage(1)
  }, [activities.length])

  const paginatedActivities = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return activities.slice(start, start + pageSize)
  }, [activities, currentPage])

  return (
    <div className="pb-24">
      <div className="sticky top-0 z-20 bg-black/40 backdrop-blur-md py-4 -mx-4 px-4 flex items-center justify-between border-b border-white/5 mb-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter">Activity History</h1>
          <p className="text-gray-400 text-sm">Latest activity appears first</p>
        </div>
        <button
          onClick={onBack}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-white transition-colors"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {isLoading ? (
        <div className="bg-gray-900 rounded-2xl p-6 border border-border/50 animate-pulse h-40"></div>
      ) : activities.length === 0 ? (
        <div className="bg-gray-900 rounded-2xl p-6 border border-border/50 text-gray-400">
          No activity logs yet.
        </div>
      ) : (
        <div className="space-y-3">
          {activities.length > pageSize && (
            <div className="flex items-center justify-between pb-1">
              <button
                onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded-lg bg-white/5 text-white text-sm hover:bg-white/10 disabled:opacity-40"
              >
                Prev
              </button>
              <span className="text-xs text-gray-400">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 rounded-lg bg-white/5 text-white text-sm hover:bg-white/10 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}

          {paginatedActivities.map(activity => {
            const status = getActivityStatus(activity)
            const duration = getActivityDurationMinutes(activity)
            return (
              <div
                key={activity.uid}
                className="bg-gray-900 rounded-2xl p-4 border border-white/10 flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <p className="text-white font-bold capitalize">{activity.type}</p>
                  <p className="text-xs text-gray-400">
                    {formatDateTime(activity.startTime || activity.timestamp)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {duration} min • {activity.caloriesBurned} kcal
                  </p>
                </div>
                <span
                  className={`text-xs font-bold uppercase px-2 py-1 rounded-full ${
                    status === 'in_progress'
                      ? 'bg-yellow-500/20 text-yellow-300'
                      : 'bg-green-500/20 text-green-300'
                  }`}
                >
                  {status === 'in_progress' ? 'In Progress' : 'Completed'}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
