"use client"

import type { Activity, Finance } from "@/models"
import { StatsCard } from "@/components/StatsCard"
import { StatsService } from "@/services/statsService"
import { Flame, Target, TrendingUp, Calendar, CheckCircle, DollarSign } from "lucide-react"

interface ProfileStatsProps {
  activities: Activity[]
  finances: Finance[]
}

export function ProfileStats({ activities, finances }: ProfileStatsProps) {
  const userStats = StatsService.calculateUserStats(activities, finances)

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Statistics</h2>

      <div className="grid grid-cols-2 gap-4">
        <StatsCard
          title="Current Streak"
          value={`${userStats.currentStreak} days`}
          icon={<Flame className="w-5 h-5" />}
        />
        <StatsCard
          title="Longest Streak"
          value={`${userStats.longestStreak} days`}
          icon={<Target className="w-5 h-5" />}
        />
        <StatsCard
          title="Tasks Completed"
          value={userStats.totalActivitiesCompleted}
          subtitle="All time"
          icon={<CheckCircle className="w-5 h-5" />}
        />
        <StatsCard
          title="Completion Rate"
          value={`${userStats.averageCompletionRate}%`}
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <StatsCard
          title="Today's Progress"
          value={`${userStats.activitiesCompletedToday}/${userStats.activitiesCreated}`}
          subtitle="Activities done"
          icon={<Calendar className="w-5 h-5" />}
        />
        <StatsCard
          title="This Month"
          value={userStats.financesThisMonth}
          subtitle="Finance entries"
          icon={<DollarSign className="w-5 h-5" />}
        />
      </div>
    </div>
  )
}
