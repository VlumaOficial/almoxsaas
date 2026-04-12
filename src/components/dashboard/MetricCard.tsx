import { ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: ReactNode
  iconBg: string
  trend?: 'up' | 'down' | 'neutral'
  trendLabel?: string
  loading?: boolean
}

export function MetricCard({
  title, value, subtitle, icon, iconBg, trend, trendLabel, loading
}: MetricCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-slate-500 font-medium">{title}</p>
          {loading ? (
            <div className="h-8 w-20 bg-slate-100 rounded animate-pulse mt-1" />
          ) : (
            <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
          )}
          {subtitle && (
            <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
          )}
          {trendLabel && (
            <span className={cn(
              'inline-flex items-center text-xs font-medium mt-2',
              trend === 'up' ? 'text-green-600' :
              trend === 'down' ? 'text-red-600' : 'text-slate-500'
            )}>
              {trendLabel}
            </span>
          )}
        </div>
        <div className={cn('p-3 rounded-xl', iconBg)}>
          {icon}
        </div>
      </div>
    </div>
  )
}