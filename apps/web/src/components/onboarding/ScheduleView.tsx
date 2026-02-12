import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FitnessTargets, WorkoutScheduleItem, generateDefaultSchedule } from '@repo/shared'

interface ScheduleViewProps {
  targets: FitnessTargets
  onComplete: (schedule: WorkoutScheduleItem[]) => void
  onBack: () => void
}

export function ScheduleView({ targets, onComplete, onBack }: ScheduleViewProps) {
  const [schedule, setSchedule] = useState<WorkoutScheduleItem[]>(() =>
    generateDefaultSchedule(targets)
  )

  const handleUpdateItem = (index: number, updates: Partial<WorkoutScheduleItem>) => {
    const newSchedule = [...schedule]
    newSchedule[index] = { ...newSchedule[index], ...updates }
    setSchedule(newSchedule)
  }

  const toggleRestDay = (index: number) => {
    const item = schedule[index]
    if (item.isRestDay) {
      handleUpdateItem(index, {
        isRestDay: false,
        workoutType: targets.workoutTypeDistribution[0]?.workoutType || 'strength',
        durationMinutes: 45,
      })
    } else {
      handleUpdateItem(index, { isRestDay: true, workoutType: null, durationMinutes: 0 })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <div className="text-center space-y-2">
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="inline-block px-4 py-1.5 rounded-full bg-[#a3e635]/10 border border-[#a3e635]/20 text-[#a3e635] text-sm font-medium mb-4"
        >
          Last Step: Your Routine
        </motion.div>
        <h1 className="text-4xl font-extrabold text-white tracking-tight">Weekly Schedule</h1>
        <p className="text-gray-400 max-w-md mx-auto">
          We've distributed your {targets.weeklyWorkoutFrequencyTarget} sessions. Drag and drop
          features coming soon—for now, tap to adjust.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#a3e635]/5 to-transparent blur-3xl -z-10 pointer-events-none" />

        {schedule.map((item, idx) => (
          <motion.div
            key={item.dayOfWeek}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
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
                    {item.dayOfWeek === 'Monday'
                      ? 'Mon'
                      : item.dayOfWeek === 'Tuesday'
                        ? 'Tue'
                        : item.dayOfWeek === 'Wednesday'
                          ? 'Wed'
                          : item.dayOfWeek === 'Thursday'
                            ? 'Thu'
                            : item.dayOfWeek === 'Friday'
                              ? 'Fri'
                              : item.dayOfWeek === 'Saturday'
                                ? 'Sat'
                                : 'Sun'}
                  </span>
                  <span className="text-lg leading-none">
                    {item.dayOfWeek === 'Wednesday'
                      ? '21'
                      : item.dayOfWeek === 'Thursday'
                        ? '22'
                        : '—'}
                  </span>
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
                          {targets.workoutTypeDistribution.map(d => (
                            <option
                              key={d.workoutType}
                              value={d.workoutType}
                              className="bg-gray-900"
                            >
                              {d.workoutType}
                            </option>
                          ))}
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

                        <button
                          onClick={() => {
                            const newSchedule = schedule.map(s => ({
                              ...s,
                              timeOfDay: item.timeOfDay,
                            }))
                            setSchedule(newSchedule)
                          }}
                          className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-[#a3e635] transition-colors"
                          title="Apply this time to all training days"
                        >
                          Apply to all
                        </button>
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
          </motion.div>
        ))}
      </div>

      <div className="flex gap-4 pt-6">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onBack}
          className="px-8 py-4 rounded-2xl font-semibold text-lg border-2 border-white/10 text-white hover:bg-white/5 transition-all"
        >
          Back
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onComplete(schedule)}
          className="flex-1 px-8 py-4 rounded-2xl font-black text-lg bg-[#a3e635] text-black hover:bg-[#bef264] shadow-[0_10px_30px_rgba(163,230,53,0.3)] transition-all flex items-center justify-center gap-3 group"
        >
          Complete Onboarding
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
        </motion.button>
      </div>
    </motion.div>
  )
}
