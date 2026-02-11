import { useEffect } from 'react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'

interface OnboardingSuccessViewProps {
  name: string
  onDone: () => void
}

export function OnboardingSuccessView({ name, onDone }: OnboardingSuccessViewProps) {
  useEffect(() => {
    // Fire confetti on mount
    const duration = 3 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min

    const interval = setInterval(function () {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      })
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      })
    }, 250)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="text-center px-6 max-w-lg"
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="w-24 h-24 bg-[#a3e635]/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-[#a3e635]/30">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#a3e635"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <h1 className="text-4xl font-bold text-white mb-4">
            Welcome aboard, <span className="text-[#a3e635]">{name}</span>!
          </h1>
          <p className="text-xl text-gray-400 mb-10">
            Your personalized fitness plan is ready. Let's start your journey to a better you.
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onDone}
            className="w-full bg-[#a3e635] text-gray-900 font-bold py-5 rounded-2xl text-xl shadow-lg shadow-[#a3e635]/20 hover:bg-[#bef264] transition-colors"
          >
            Go to Dashboard
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  )
}
