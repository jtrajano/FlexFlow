import React from 'react'
import { useAuth } from '../../hooks/useAuth'
import { signOut } from 'firebase/auth'
import { auth } from '../../lib/firebase'

export function GreetingHeader() {
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
          className="p-2.5 rounded-full bg-muted/20 hover:bg-muted/30 transition-colors relative group"
          aria-label="Notifications"
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
            className="text-muted-foreground"
          >
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
          {/* Notification dot */}
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-primary rounded-full border border-background"></span>
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
