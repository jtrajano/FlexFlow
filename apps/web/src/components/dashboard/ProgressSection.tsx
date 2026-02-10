import React from 'react'
import { CircularProgress } from './CircularProgress'

export function ProgressSection() {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-white mb-4">Today's Progress</h3>

      <div className="bg-gray-900 rounded-2xl p-6 border border-border/50">
        <div className="grid grid-cols-3 gap-4">
          <CircularProgress
            value={75}
            max={100}
            label="Move"
            color="#a3e635" // lime-400
          />
          <CircularProgress
            value={60}
            max={100}
            label="Exercise"
            color="#f97316" // orange-500
          />
          <CircularProgress
            value={90}
            max={100}
            label="Stand"
            color="#38bdf8" // sky-400
          />
        </div>
      </div>

      {/* Decorative bottom glow representing the dock/navigation highlight from the image */}
      <div className="relative h-1 mt-8 hidden">
        <div className="absolute left-1/2 transform -translate-x-1/2 bottom-0 w-1/3 h-20 bg-primary/20 blur-3xl rounded-full pointer-events-none"></div>
      </div>
    </div>
  )
}
