/**
 * =============================================================================
 * WELCOME TO THE HYTEL WAY: MONOREPO STACK
 * =============================================================================
 *
 * This file demonstrates the key concepts of our tech stack using friendly
 * analogies. Think of building a web app like putting on a theater production!
 *
 * THE STACK EXPLAINED (Theater Analogy):
 *
 * PNPM (Package Manager)
 *    -> "The super-organized prop master"
 *    -> Manages all the tools/packages we need, storing them efficiently
 *    -> Unlike npm, it doesn't duplicate packages - saves space!
 *
 * TURBOREPO (Monorepo Build System)
 *    -> "The stage manager who coordinates everything"
 *    -> Runs tasks (build, test, dev) across multiple packages smartly
 *    -> Caches results so repeated tasks are lightning fast!
 *
 * REACT + VITE (Frontend Framework + Build Tool)
 *    -> "The stage and lighting system"
 *    -> React: Builds the interactive UI (the actors on stage)
 *    -> Vite: Super-fast dev server (instant lighting changes!)
 *
 * TAILWIND CSS + SHADCN UI (Styling)
 *    -> "The costume designer"
 *    -> Tailwind: Utility classes for quick styling (fabric swatches)
 *    -> Shadcn UI: Pre-made, beautiful component patterns (costume templates)
 *
 * @repo/ui (Shared Component Package)
 *    -> "The shared costume closet"
 *    -> Components here (Header, Button, Card) can be used by ANY app!
 *    -> Located in: packages/ui/
 *
 * @repo/shared (Shared Types & Schemas)
 *    -> "The spellbook of shared rules"
 *    -> Zod schemas define what data looks like (validation spells!)
 *    -> Located in: packages/shared/
 *
 * tRPC + TanStack Query (API Layer)
 *    -> "The messenger system between actors"
 *    -> tRPC: Type-safe communication with backend (no lost messages!)
 *    -> TanStack Query: Smart caching of server data (remembers the script!)
 *
 * =============================================================================
 */

// import { useState } from 'react'
import './style.css'

import { useAuth } from './hooks/useAuth'
import { LoginView } from './components/auth/LoginView'
import { Dashboard } from './components/dashboard/Dashboard'

/**
 * Main App Component
 *
 * This is the "main stage" of our application. Everything you see
 * in the browser starts here!
 */
export function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return <LoginView />
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Dashboard />
    </div>
  )
}
