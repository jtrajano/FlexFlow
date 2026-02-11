import React from 'react'
import { Button } from '@repo/ui/Button'

export function GoalCard() {
  return (
    <div className="relative rounded-2xl overflow-hidden mb-8 h-48 group">
      {/* Background Image/Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-900/90 to-black/80 z-0">
        {/* We can add a real bg image here later */}
        <div className="absolute inset-0 bg-[url('/hero-fitness.jpg')] bg-cover bg-center mix-blend-overlay opacity-40"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center px-6 md:px-10">
        <span className="text-primary font-bold tracking-wider text-xs uppercase mb-2">
          Today's Goal
        </span>
        <h2 className="text-3xl font-bold text-white mb-1">Push your limits</h2>
        <p className="text-muted-foreground text-sm mb-6">3 workouts remaining</p>

        <Button className="w-fit bg-green-500 text-primary-foreground hover:bg-green-500/90 rounded-full px-6 font-bold">
          Start Workout
        </Button>
      </div>

      {/* Decorative blurred glow */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/10 to-transparent pointer-events-none"></div>
    </div>
  )
}
