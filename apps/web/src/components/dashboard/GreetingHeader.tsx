import React from 'react'
import { useAuth } from '../../hooks/useAuth'
import { signOut } from 'firebase/auth'
import { auth } from '../../lib/firebase'

export function GreetingHeader({ onHistoryClick }: { onHistoryClick?: () => void }) {
  const { user } = useAuth()

  // Extracting first name if available, or fallback
  const displayName = user?.displayName?.split(' ')[0] || 'Athlete'

  const handleLogout = () => {
    signOut(auth).catch(error => {
      console.error('Error signing out:', error)
    })
  }

  return (
    <header className="flex justify-between items-center mb-6">
      <div>
        <h2 className="text-muted-foreground text-sm font-medium">Good morning</h2>
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold text-white max-[400px]:mt-2">{displayName}</h1>
          <span className="text-2xl animate-pulse">💪</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onHistoryClick}
          className="p-2 rounded-full bg-muted/20 hover:bg-muted/30 text-muted-foreground hover:text-white transition-colors"
          aria-label="Activity History"
          title="Activity History"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="3 3 3 9 9 9" />
            <path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" />
            <path d="M12 7v5l3 3" />
          </svg>
        </button>

        <button
          onClick={handleLogout}
          className="p-2 rounded-full bg-muted/20 hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
          aria-label="Logout"
          title="Logout"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </header>
  )
}
