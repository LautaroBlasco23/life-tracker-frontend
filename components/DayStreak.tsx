import type { DayStreak } from "@/models/stats"
import { Check } from "lucide-react"

interface DayStreakProps {
  streak: DayStreak[]
}

export function DayStreakComponent({ streak }: DayStreakProps) {
  return (
    <div className="bg-card rounded-lg p-4 border">
      <h3 className="text-sm font-medium text-muted-foreground mb-3">7-Day Streak</h3>
      <div className="flex justify-between items-center">
        {streak.map((day, index) => (
          <div key={index} className="flex flex-col items-center gap-1">
            <span className="text-xs text-muted-foreground">{day.dayOfWeek}</span>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                day.completed ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {day.completed && <Check className="w-4 h-4" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
