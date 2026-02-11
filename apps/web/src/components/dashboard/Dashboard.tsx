import React, { useState } from 'react'
import { GreetingHeader } from './GreetingHeader'
import { GoalCard } from './GoalCard'
import { ProgressSection } from './ProgressSection'
import { StatsSection } from './StatsSection'
import { RecommendedSection } from './RecommendedSection'
import { WeeklyActivitySection } from './WeeklyActivitySection'
import { BottomNav } from './BottomNav'
import { LogActivityModal } from './LogActivityModal'

export function Dashboard() {
  const [showLogModal, setShowLogModal] = useState(false)

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 py-6 min-h-screen pb-28">
        <GreetingHeader />
        <GoalCard onStartClick={() => setShowLogModal(true)} />
        <ProgressSection />
        <StatsSection />
        <RecommendedSection />
        <WeeklyActivitySection />
      </div>
      <BottomNav onAddClick={() => setShowLogModal(true)} />
      <LogActivityModal isOpen={showLogModal} onClose={() => setShowLogModal(false)} />
    </>
  )
}
