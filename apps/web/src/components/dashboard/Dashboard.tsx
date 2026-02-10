import React from 'react'
import { GreetingHeader } from './GreetingHeader'
import { GoalCard } from './GoalCard'
import { ProgressSection } from './ProgressSection'
import { StatsSection } from './StatsSection'
import { RecommendedSection } from './RecommendedSection'
import { WeeklyActivitySection } from './WeeklyActivitySection'
import { BottomNav } from './BottomNav'

export function Dashboard() {
  return (
    <>
      <div className="max-w-4xl mx-auto px-4 py-6 min-h-screen pb-28">
        <GreetingHeader />
        <GoalCard />
        <ProgressSection />
        <StatsSection />
        <RecommendedSection />
        <WeeklyActivitySection />
      </div>
      <BottomNav />
    </>
  )
}
