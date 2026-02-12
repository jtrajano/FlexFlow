import React from 'react' // Triggering re-render for style updates
import { motion } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import { useUserGoals } from '../../hooks/useUserGoals'
import { useLatestBodyMetrics } from '../../hooks/useBodyMetrics'
import { useTodaySchedule } from '../../hooks/useUserSchedule'
import { getRecommendedWorkouts } from '@repo/shared'

interface WorkoutCardProps {
  title: string
  description: string
  duration: string
  calories: string
  icon: React.ReactNode
  bgGradient: string
}

function WorkoutCard({
  title,
  description,
  duration,
  calories,
  icon,
  bgGradient,
}: WorkoutCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative rounded-2xl overflow-hidden p-5 min-w-[240px] group cursor-pointer transition-transform hover:scale-105 ${bgGradient}`}
    >
      <div className="flex justify-between items-start mb-8">
        <div className="p-2 rounded-xl bg-white/10 backdrop-blur-sm">{icon}</div>
        <button className="text-white/80 hover:text-white transition-colors">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      <div>
        <h4 className="text-white font-bold text-base mb-1">{title}</h4>
        <p className="text-white/70 text-xs mb-4 line-clamp-2">{description}</p>

        <div className="flex items-center gap-4 text-xs text-white/60">
          <div className="flex items-center gap-1">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>{duration} min</span>
          </div>
          <div className="flex items-center gap-1">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-2.246-5.364 1-9 3.931 5.865 3.867 8.657 2.001 11.232a4.482 4.482 0 0 0 .991-6.191C16.5 6.5 14 10 14 10c2.175.72 5 2.5 5 5 0 2.5-2.5 5-5 5-3.5 0-7-2-7-5.5S8.5 14.5 8.5 14.5z" />
            </svg>
            <span>{calories} kcal</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function RecommendedSection() {
  const { user } = useAuth()
  const { data: goals, isLoading: goalsLoading } = useUserGoals(user?.uid)
  const { data: metrics, isLoading: metricsLoading } = useLatestBodyMetrics(user?.uid)
  const { isRestDay, isLoading: scheduleLoading } = useTodaySchedule(user?.uid)

  // Show loading only if all three are still loading (initial load)
  const isInitialLoading = goalsLoading && metricsLoading && scheduleLoading

  if (isInitialLoading) {
    return (
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-white mb-4">Recommended</h3>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {[1, 2, 3].map(i => (
            <div key={i} className="min-w-[240px] h-48 bg-gray-900 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  // Use default values if data hasn't loaded yet
  const userPrefs = goals?.workoutPreferences ? goals.workoutPreferences.split(',') : []
  const recommendations = getRecommendedWorkouts(
    userPrefs,
    metrics?.weight || 70,
    3,
    isRestDay || false
  )

  // Mapping workout types to icons
  const getIcon = (type: string) => {
    switch (type) {
      case 'strength':
      case 'crossfit':
        return (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 9H4a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2" />
            <path d="M18 9h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2" />
            <path d="M6 12h12" />
            <path d="M6.5 6h11" />
            <path d="M6.5 18h11" />
          </svg>
        )
      case 'hiit':
      case 'cardio':
        return (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        )
      case 'yoga':
      case 'pilates':
        return (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v8" />
            <path d="M8 12h8" />
          </svg>
        )
      case 'meditation':
        return (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
            <path d="M12 7l0 10" />
            <path d="M7 12l10 0" />
            <path d="M8.5 8.5l7 7" />
            <path d="M8.5 15.5l7 -7" />
          </svg>
        )
      case 'breathing':
        return (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
            <path d="M12 12c-2 -2.5 -2 -5 0 -8c2 3 2 5.5 0 8z" />
            <path d="M12 12c2 2.5 2 5 0 8c-2 -3 -2 -5.5 0 -8z" />
          </svg>
        )
      default:
        return (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        )
    }
  }

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">
            {isRestDay ? 'Active Recovery' : 'Recommended for You'}
          </h3>
          {isRestDay && (
            <p className="text-xs text-gray-500 mt-1">
              Today is a rest day. Keep your body moving with these light activities.
            </p>
          )}
        </div>
        <button className="text-primary text-sm font-medium hover:underline">See all</button>
      </div>

      <motion.div
        className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide"
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
      >
        {recommendations.map(workout => (
          <WorkoutCard
            key={workout.id}
            title={workout.title}
            description={workout.description}
            duration={workout.duration.toString()}
            calories={workout.calories.toLocaleString()}
            bgGradient={workout.bgGradient}
            icon={getIcon(workout.type)}
          />
        ))}
      </motion.div>
    </div>
  )
}
