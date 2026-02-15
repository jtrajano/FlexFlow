import { useState } from 'react'
import { GreetingHeader } from '../components/dashboard/GreetingHeader'
import { GoalCard } from '../components/dashboard/GoalCard'
import { ProgressSection } from '../components/dashboard/ProgressSection'
import { StatsSection } from '../components/dashboard/StatsSection'
import { RecommendedSection } from '../components/dashboard/RecommendedSection'
import { WeeklyActivitySection } from './WeeklyActivitySection'
import { BottomNav } from '../components/dashboard/BottomNav'
import { WorkoutsView } from './WorkoutsView'
import { LogActivityView } from './LogActivityView'
import { StatisticsPage } from './StatisticsPage'
import { ProfileView } from './ProfileView'
import { ActivityHistoryView } from './ActivityHistoryView'
import { useAuth } from '../hooks/useAuth'
import { useRunningActivity } from '../hooks/useRunningActivity'

export function Dashboard() {
  const { user } = useAuth()
  const { data: runningActivity } = useRunningActivity(user?.uid)

  const [activeTab, setActiveTab] = useState('home')

  const renderContent = () => {
    switch (activeTab) {
      case 'workouts':
        return <WorkoutsView onBack={() => setActiveTab('home')} />
      case 'log-activity':
        return <LogActivityView onBack={() => setActiveTab('home')} />
      case 'stats':
        return <StatisticsPage onBack={() => setActiveTab('home')} />
      case 'profile':
        return <ProfileView onBack={() => setActiveTab('home')} />
      case 'activity-history':
        return <ActivityHistoryView onBack={() => setActiveTab('home')} />
      // Add other cases later
      default:
        return (
          <>
            <GreetingHeader onHistoryClick={() => setActiveTab('activity-history')} />
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
      <div className="min-h-screen bg-background pb-24">{renderContent()}</div>

      {activeTab !== 'workouts' &&
        activeTab !== 'log-activity' &&
        activeTab !== 'stats' &&
        activeTab !== 'profile' &&
        activeTab !== 'activity-history' && (
          <BottomNav
            onAddClick={() => setActiveTab('log-activity')}
            activeTab={activeTab}
            onNavigate={setActiveTab}
            isAddDisabled={!!runningActivity}
          />
        )}
    </>
  )
}
