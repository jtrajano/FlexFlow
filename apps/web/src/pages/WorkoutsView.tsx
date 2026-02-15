import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useQueryClient } from '@tanstack/react-query'
import { WorkoutScheduleItem, WorkoutTypeDistribution } from '@repo/shared'
import { useAuth } from '../hooks/useAuth'
import { useUserSchedule } from '../hooks/useUserSchedule'
import { useUserGoals } from '../hooks/useUserGoals'
import { doc, setDoc, collection } from 'firebase/firestore'
import { db } from '../lib/firebase'

export function WorkoutsView({ onBack }: { onBack: () => void }) {
  const { user } = useAuth()
  const { data: scheduleData, isLoading: scheduleLoading } = useUserSchedule(user?.uid)
  const { data: goals, isLoading: goalsLoading } = useUserGoals(user?.uid)
  const queryClient = useQueryClient()

  const [schedule, setSchedule] = useState<WorkoutScheduleItem[]>([])
  const [isSaving, setIsSaving] = useState(false)

  // Initialize schedule from fetched data
  useEffect(() => {
    if (scheduleData) {
      // Ensure we fill null values for controlled inputs
      const safeSchedule = scheduleData.items.map(item => ({
        ...item,
        workoutType: item.workoutType || null,
      }))
      setSchedule(safeSchedule)
    }
  }, [scheduleData])

  const handleUpdateItem = (index: number, updates: Partial<WorkoutScheduleItem>) => {
    const newSchedule = [...schedule]
    newSchedule[index] = { ...newSchedule[index], ...updates }
    setSchedule(newSchedule)
  }

  const toggleRestDay = (index: number) => {
    const item = schedule[index]
    if (item.isRestDay) {
      // Use the first preferred workout type as default, or 'strength'
      const defaultType = goals?.workoutTypeDistribution?.[0]?.workoutType || 'strength'

      handleUpdateItem(index, {
        isRestDay: false,
        workoutType: defaultType,
        durationMinutes: 45,
      })
    } else {
      handleUpdateItem(index, { isRestDay: true, workoutType: null, durationMinutes: 0 })
    }
  }

  const handleSave = async () => {
    console.log('handleSave called', { user: !!user, goals: !!goals })
    if (!user || !goals) {
      console.log('Missing user or goals', { user, goals })
      return
    }
    setIsSaving(true)
    try {
      // Correctly reference the collection and document
      const scheduleRef = doc(
        db,
        'userWorkoutSchedules',
        scheduleData?.uid || doc(collection(db, 'userWorkoutSchedules')).id
      )
      const currentDate = new Date().toISOString()

      await setDoc(
        scheduleRef,
        {
          uid: scheduleRef.id,
          userId: user.uid,
          userGoalId: goals.uid || '', // Link to current goal
          items: schedule.map(item => ({
            ...item,
            workoutType: item.workoutType || null,
          })),
          updatedAt: currentDate,
          createdAt: scheduleData?.createdAt || currentDate,
        },
        { merge: true }
      )

      // Invalidate the query to fetch fresh data
      await queryClient.invalidateQueries({ queryKey: ['userSchedule', user.uid] })

      onBack()
    } catch (error) {
      console.error('Error saving schedule:', error)
      alert('Failed to save schedule.')
    } finally {
      setIsSaving(false)
    }
  }

  if (scheduleLoading || goalsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // If no schedule exists yet, we could potentially generate one here or show empty state.
  // For now assuming schedule exists if onboarding completed.
  if (schedule.length === 0 && !scheduleLoading) {
    return (
      <div className="text-center text-gray-400 mt-10">
        No schedule found. Please complete onboarding.
      </div>
    )
  }

  return (
    <motion.div className="max-w-4xl mx-auto pb-24 space-y-8">
      <div className="sticky top-0 z-20 bg-black/40 backdrop-blur-md py-4 -mx-4 px-4 flex items-center justify-between border-b border-white/5">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter">My Weekly Plan</h1>
          <p className="text-gray-400 text-sm">Customize your training schedule</p>
        </div>
        <button
          onClick={onBack}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-white transition-colors"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#a3e635]/5 to-transparent blur-3xl -z-10 pointer-events-none" />

        {schedule.map((item, idx) => (
          <div
            key={item.dayOfWeek}
            className={`group relative p-5 rounded-3xl border transition-all duration-300 ${
              item.isRestDay
                ? 'bg-gray-900/20 border-white/5 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 hover:border-white/10'
                : 'bg-gradient-to-r from-gray-900/80 to-black/40 border-white/10 shadow-xl border-[#a3e635]/10'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6 flex-1">
                <div
                  className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-bold transition-colors ${
                    item.isRestDay
                      ? 'bg-white/5 text-gray-500'
                      : 'bg-[#a3e635] text-black shadow-[0_0_15px_rgba(163,230,53,0.3)]'
                  }`}
                >
                  <span className="text-[10px] uppercase tracking-tighter opacity-60 leading-none mb-1">
                    {item.dayOfWeek.slice(0, 3)}
                  </span>
                  <span className="text-xl leading-none tracking-tighter">{idx + 1}</span>
                </div>

                <div className="flex-1">
                  {item.isRestDay ? (
                    <p className="text-gray-500 font-medium tracking-wide">Recovery Day</p>
                  ) : (
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <select
                          value={item.workoutType || ''}
                          onChange={e => handleUpdateItem(idx, { workoutType: e.target.value })}
                          className="bg-transparent text-lg font-bold text-white capitalize focus:outline-none cursor-pointer hover:text-[#a3e635] transition-colors appearance-none"
                        >
                          {goals?.workoutTypeDistribution?.map((d: WorkoutTypeDistribution) => (
                            <option
                              key={d.workoutType}
                              value={d.workoutType}
                              className="bg-gray-900"
                            >
                              {d.workoutType}
                            </option>
                          ))}
                          {/* Add a fallback option if types are missing or to allow manual add */}
                          {!goals?.workoutTypeDistribution?.find(
                            (d: WorkoutTypeDistribution) => d.workoutType === item.workoutType
                          ) &&
                            item.workoutType && (
                              <option value={item.workoutType} className="bg-gray-900">
                                {item.workoutType}
                              </option>
                            )}
                        </select>
                        <div className="w-1.5 h-1.5 rounded-full bg-[#a3e635]/30" />
                        <div className="flex items-center gap-1 group/input">
                          <input
                            type="number"
                            value={item.durationMinutes}
                            onChange={e =>
                              handleUpdateItem(idx, { durationMinutes: Number(e.target.value) })
                            }
                            className="w-10 bg-white/5 border border-transparent focus:border-[#a3e635]/20 rounded-md text-center text-[#a3e635] font-bold focus:outline-none transition-all"
                          />
                          <span className="text-xs text-gray-500 font-medium">min</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 hover:border-[#a3e635]/30 transition-all group/time">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            className="text-gray-500 group-hover/time:text-[#a3e635] transition-colors"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                          <input
                            type="time"
                            value={item.timeOfDay}
                            onChange={e => handleUpdateItem(idx, { timeOfDay: e.target.value })}
                            className="bg-transparent border-none p-0 text-gray-200 font-medium focus:text-white transition-colors cursor-pointer focus:outline-none [color-scheme:dark]"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => toggleRestDay(idx)}
                className={`flex flex-col items-center gap-1 group/btn transition-all ${
                  item.isRestDay ? 'text-[#a3e635]' : 'text-gray-600'
                }`}
              >
                <div
                  className={`p-2 rounded-xl transition-all ${
                    item.isRestDay
                      ? 'bg-[#a3e635]/10 group-hover/btn:bg-[#a3e635]/20'
                      : 'bg-white/5 group-hover/btn:bg-white/10'
                  }`}
                >
                  {item.isRestDay ? (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  ) : (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
                      <line x1="12" y1="2" x2="12" y2="12" />
                    </svg>
                  )}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.isRestDay ? 'Train' : 'Rest'}
                </span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-8 left-0 right-0 px-4 z-40">
        <div className="max-w-4xl mx-auto flex justify-center gap-3">
          <button
            onClick={onBack}
            className="px-8 py-4 rounded-2xl font-semibold text-lg border-2 border-white/10 text-white hover:bg-white/5 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-8 py-4 rounded-2xl font-black text-lg bg-[#a3e635] text-black hover:bg-[#bef264] shadow-[0_10px_30px_rgba(163,230,53,0.3)] transition-all flex items-center justify-center gap-3 group disabled:opacity-50 disabled:hover:scale-100"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
            {!isSaving && (
              <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  )
}
