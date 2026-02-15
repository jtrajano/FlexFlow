import { motion } from 'framer-motion'
import { StatCardProps } from '../../interface/StatCardProps'

export function StatCard({
  label,
  value,
  unit,
  icon,
  color = 'bg-[#a3e635]',
  trend,
  description,
}: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-gray-900/50 backdrop-blur-md border border-white/10 p-5 rounded-2xl relative overflow-hidden group hover:border-white/20 transition-all"
    >
      <div
        className={`absolute top-0 right-0 w-24 h-24 ${color} opacity-5 blur-2xl -mr-10 -mt-10 rounded-full group-hover:opacity-10 transition-opacity`}
      />

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-3">
          <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">{label}</span>
          <div
            className={`p-2 rounded-xl bg-white/5 text-white ${color.replace('bg-', 'text-')}/80`}
          >
            {icon}
          </div>
        </div>

        <div className="flex items-baseline gap-1 mb-1">
          <h3 className="text-2xl font-black text-white tracking-tight">{value}</h3>
          <span className="text-xs font-medium text-gray-500">{unit}</span>
        </div>

        {trend && (
          <div
            className={`text-xs font-semibold flex items-center gap-1 ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`}
          >
            <span>{trend.isPositive ? '↑' : '↓'}</span>
            <span>{Math.abs(trend.value)}% vs last week</span>
          </div>
        )}

        {description && <p className="text-xs text-gray-500 mt-2">{description}</p>}
      </div>
    </motion.div>
  )
}
