export interface StatCardProps {
  label: string
  value: string | number
  unit: string
  icon: React.ReactNode
  color?: string
  trend?: { value: number; isPositive: boolean }
  description?: string
}
