import { useEffect, useState } from 'react'

interface CircularProgressProps {
  value: number
  max: number
  label: string
  unit?: string
  color: string
  size?: number
  strokeWidth?: number
}

export function CircularProgress({
  value,
  max,
  label,
  unit,
  color,
  size = 120,
  strokeWidth = 8,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const progress = value / max
  const targetDashoffset = circumference - progress * circumference

  // State to animate from 0 to actual value
  const [dashoffset, setDashoffset] = useState(circumference)

  useEffect(() => {
    // Start animation after a brief delay to ensure smooth transition
    const timer = setTimeout(() => {
      setDashoffset(targetDashoffset)
    }, 50)

    return () => clearTimeout(timer)
  }, [targetDashoffset])

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background Circle */}
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-muted/20"
          />
          {/* Progress Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={dashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        {/* Value Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-white leading-none">{value}</span>
          {unit && (
            <span className="text-[10px] text-muted-foreground uppercase mt-0.5">{unit}</span>
          )}
        </div>
      </div>
      <span className="mt-2 text-sm text-muted-foreground font-medium">{label}</span>
    </div>
  )
}
