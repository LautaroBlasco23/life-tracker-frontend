import type React from "react"
interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: React.ReactNode
}

export function StatsCard({ title, value, subtitle, icon }: StatsCardProps) {
  return (
    <div className="bg-card rounded-lg p-4 border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
    </div>
  )
}
