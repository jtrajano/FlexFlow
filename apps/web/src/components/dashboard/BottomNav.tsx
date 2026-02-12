import React from 'react'

interface NavItemProps {
  icon: React.ReactNode
  label: string
  isActive?: boolean
  onClick?: () => void
}

function NavItem({ icon, label, isActive = false, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 flex-1 transition-colors ${
        isActive ? 'text-primary' : 'text-muted-foreground hover:text-white'
      }`}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </button>
  )
}

interface BottomNavProps {
  onAddClick?: () => void
  activeTab: string
  onNavigate: (tab: string) => void
}

export function BottomNav({ onAddClick, activeTab, onNavigate }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
      <div className="max-w-2xl mx-auto px-4 pb-4">
        <nav className="bg-gray-900/95 backdrop-blur-lg border border-border/50 rounded-2xl shadow-2xl">
          <div className="flex items-center justify-around px-2 py-3 relative">
            {/* Home */}
            <NavItem
              isActive={activeTab === 'home'}
              label="Home"
              onClick={() => onNavigate('home')}
              icon={
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
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              }
            />

            {/* Workouts */}
            <NavItem
              isActive={activeTab === 'workouts'}
              label="Workouts"
              onClick={() => onNavigate('workouts')}
              icon={
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
                  <path d="m6.5 6.5 11 11" />
                  <path d="m21 21-1-1" />
                  <path d="m3 3 1 1" />
                  <path d="m18 22 4-4" />
                  <path d="m2 6 4-4" />
                  <path d="m3 10 7-7" />
                  <path d="m14 21 7-7" />
                </svg>
              }
            />

            {/* Center Add Button */}
            <button
              onClick={onAddClick}
              className="flex items-center 
            justify-center w-12 h-12 -mt-7 rounded-full bg-green-500 text-primary-foreground shadow-lg hover:bg-green-500/90 transition-all hover:scale-110"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>

            {/* Stats */}
            <NavItem
              isActive={activeTab === 'stats'}
              label="Stats"
              onClick={() => onNavigate('stats')}
              icon={
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
                  <line x1="12" y1="20" x2="12" y2="10" />
                  <line x1="18" y1="20" x2="18" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="16" />
                </svg>
              }
            />

            {/* Profile */}
            <NavItem
              isActive={activeTab === 'profile'}
              label="Profile"
              onClick={() => onNavigate('profile')}
              icon={
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
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              }
            />
          </div>
        </nav>
      </div>
    </div>
  )
}
