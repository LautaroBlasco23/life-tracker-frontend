"use client"

import type { Activity } from "@/models"
import { ActivityCard } from "./ActivityCard"

interface TimeGroupSectionProps {
  timeGroup: "morning" | "afternoon" | "evening"
  activities: Activity[]
}

const timeGroupLabels = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
}

const timeGroupIcons = {
  morning: "🌅",
  afternoon: "☀️",
  evening: "🌙",
}

export function TimeGroupSection({ timeGroup, activities }: TimeGroupSectionProps) {
  if (activities.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{timeGroupIcons[timeGroup]}</span>
        <h2 className="text-xl font-semibold text-foreground">{timeGroupLabels[timeGroup]}</h2>
        <div className="flex-1 h-px bg-border"></div>
        <span className="text-sm text-muted-foreground">{activities.length} activities</span>
      </div>
      <div className="grid gap-4">
        {activities.map((activity) => (
          <ActivityCard key={activity.id} activity={activity} />
        ))}
      </div>
    </div>
  )
}
