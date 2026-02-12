import React, { useState } from 'react'
import { GreetingHeader } from './GreetingHeader'
import { GoalCard } from './GoalCard'
import { ProgressSection } from './ProgressSection'
import { StatsSection } from './StatsSection'
import { RecommendedSection } from './RecommendedSection'
import { WeeklyActivitySection } from './WeeklyActivitySection'
import { BottomNav } from './BottomNav'
import { LogActivityModal } from './LogActivityModal'
import { WorkoutsView } from './WorkoutsView'
import { LogActivityView } from './LogActivityView'
import { StatisticsPage } from './StatisticsPage'

export function Dashboard() {
  const [showLogModal, setShowLogModal] = useState(false)
  const [activeTab, setActiveTab] = useState('home')

  const renderContent = () => {
    switch (activeTab) {
      case 'workouts':
        return <WorkoutsView onBack={() => setActiveTab('home')} />
      case 'log-activity':
        return <LogActivityView onBack={() => setActiveTab('home')} />
      case 'stats':
        return <StatisticsPage onBack={() => setActiveTab('home')} />
      // Add other cases later ('profile')
      default:
        return (
          <>
            <GreetingHeader />
            <GoalCard onStartClick={() => setActiveTab('log-activity')} />
            <ProgressSection />
            <StatsSection />
            <RecommendedSection />
            <WeeklyActivitySection />
          </>
        )
    }
  }

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 py-6 min-h-screen pb-28">{renderContent()}</div>

      {activeTab !== 'workouts' && activeTab !== 'log-activity' && (
        <BottomNav
          onAddClick={() => setActiveTab('log-activity')}
          activeTab={activeTab}
          onNavigate={setActiveTab}
        />
      )}
      <LogActivityModal isOpen={showLogModal} onClose={() => setShowLogModal(false)} />
    </>
  )
}
