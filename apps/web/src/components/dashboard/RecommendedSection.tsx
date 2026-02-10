import React from 'react'

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
    <div
      className={`relative rounded-2xl overflow-hidden p-5 min-w-[200px] group cursor-pointer transition-transform hover:scale-105 ${bgGradient}`}
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
        <p className="text-white/70 text-xs mb-4">{description}</p>

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
            <span>{duration}</span>
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
            <span>{calories}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function RecommendedSection() {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">Recommended</h3>
        <button className="text-primary text-sm font-medium hover:underline">See all</button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        <WorkoutCard
          title="Upper Body Power"
          description="Chest, shoulders & arms"
          duration="45 min"
          calories="320 cal"
          bgGradient="bg-gradient-to-br from-green-900/80 to-green-950/90"
          icon={
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
              <path d="M6.5 6.5a4 4 0 0 1 5.657 0l.343.343.343-.343a4 4 0 1 1 5.657 5.657l-6 6-6-6a4 4 0 0 1 0-5.657z" />
            </svg>
          }
        />

        <WorkoutCard
          title="HIIT Cardio Blast"
          description="Full body intervals"
          duration="30 min"
          calories="450 cal"
          bgGradient="bg-gradient-to-br from-gray-800/80 to-gray-900/90"
          icon={
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
          }
        />

        <WorkoutCard
          title="Core & Flexibility"
          description="Abs, yoga & stretching"
          duration="35 min"
          calories="200 cal"
          bgGradient="bg-gradient-to-br from-blue-900/80 to-blue-950/90"
          icon={
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
              <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
              <path d="M13 13l6 6" />
            </svg>
          }
        />
      </div>
    </div>
  )
}
