import React from 'react'
import { GreetingHeader } from './GreetingHeader'
import { GoalCard } from './GoalCard'
import { ProgressSection } from './ProgressSection'

export function Dashboard() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 min-h-screen">
      <GreetingHeader />
      <GoalCard />
      <ProgressSection />
    </div>
  )
}
