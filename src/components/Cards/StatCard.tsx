import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { ReactNode } from 'react'

interface StatCardProps {
  title: string
  value: string | number
  unit?: string
  icon: ReactNode
  trend?: 'up' | 'down' | 'stable'
  trendValue?: string
  color?: string
  status?: 'normal' | 'warning' | 'danger' | 'info'
}

export default function StatCard({
  title,
  value,
  unit,
  icon,
  trend,
  trendValue,
  color = 'ocean',
  status = 'normal',
}: StatCardProps) {
  const colorClasses = {
    ocean: 'text-ocean-400',
    green: 'text-status-normal',
    yellow: 'text-status-warning',
    red: 'text-status-danger',
    blue: 'text-status-info',
  }

  const statusClasses = {
    normal: 'border-ocean-500/20',
    warning: 'border-status-warning/50',
    danger: 'border-status-danger/50',
    info: 'border-status-info/50',
  }

  return (
    <div className={`card ${statusClasses[status]} border-2`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg bg-${color}-500/20 ${colorClasses[color]}`}>
          {icon}
        </div>
        {trend && trendValue && (
          <div
            className={`flex items-center gap-1 text-sm ${
              trend === 'up'
                ? 'text-status-danger'
                : trend === 'down'
                ? 'text-status-normal'
                : 'text-gray-400'
            }`}
          >
            {trend === 'up' ? (
              <TrendingUp size={16} />
            ) : trend === 'down' ? (
              <TrendingDown size={16} />
            ) : (
              <Minus size={16} />
            )}
            <span>{trendValue}</span>
          </div>
        )}
      </div>

      <div className="mb-2">
        <div className="stat-value">{value}</div>
        {unit && <span className="text-sm text-gray-400 ml-2">{unit}</span>}
      </div>

      <div className="text-sm text-gray-400 font-medium">{title}</div>
    </div>
  )
}
