import { Button } from '@repo/ui/Button'
import { useAuth } from '../../hooks/useAuth'
import { useTodaySchedule } from '../../hooks/useUserSchedule'

interface GoalCardProps {
  onStartClick?: () => void
}

export function GoalCard({ onStartClick }: GoalCardProps) {
  const { user } = useAuth()
  const { todayWorkout, isRestDay, isLoading } = useTodaySchedule(user?.uid)

  if (isLoading) {
    return <div className="rounded-2xl h-48 bg-gray-900 animate-pulse mb-8" />
  }

  return (
    <div className="relative rounded-2xl overflow-hidden mb-8 h-48 group">
      {/* Background Image/Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-900/90 to-black/80 z-0">
        <div className="absolute inset-0 bg-[url('/hero-fitness.jpg')] bg-cover bg-center mix-blend-overlay opacity-40"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center px-6 md:px-10">
        <span className="text-primary font-bold tracking-wider text-xs uppercase mb-2">
          TODAY'S GOAL
        </span>
        <h2 className="text-3xl font-bold text-white mb-1">
          {isRestDay ? 'Rest & Recovery' : todayWorkout?.workoutType?.toUpperCase() || 'Workout'}
        </h2>
        <p className="text-muted-foreground text-sm mb-6">
          {isRestDay
            ? 'Take it easy today. Your muscles need time to rebuild.'
            : `${todayWorkout?.durationMinutes || 0} mins • ${todayWorkout?.timeOfDay ? todayWorkout.timeOfDay : 'Flexible timing'}`}
        </p>

        <Button
          onClick={onStartClick}
          className="w-fit bg-green-500 text-primary-foreground hover:bg-green-500/90 rounded-full px-6 font-bold"
        >
          {isRestDay ? 'Log Recovery Activity' : 'Start Workout'}
        </Button>
      </div>

      {/* Decorative blurred glow */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/10 to-transparent pointer-events-none"></div>
    </div>
  )
}
