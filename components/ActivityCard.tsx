"use client"

import type { Activity } from "@/models"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useAppContext } from "@/context/AppContext"

interface ActivityCardProps {
  activity: Activity
}

export function ActivityCard({ activity }: ActivityCardProps) {
  const { dispatch } = useAppContext()

  const progressPercentage =
    activity.maxCompletionAmount > 0
      ? Math.min((activity.completionAmount / activity.maxCompletionAmount) * 100, 100)
      : 0

  const handleCardClick = () => {
    if (activity.completionAmount < activity.maxCompletionAmount) {
      dispatch({
        type: "UPDATE_ACTIVITY",
        payload: {
          id: activity.id,
          updates: { completionAmount: activity.completionAmount + 1 },
        },
      })
    }
  }

  return (
    <Card className="bg-card border-border cursor-pointer hover:bg-card/80 transition-colors" onClick={handleCardClick}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-card-foreground">{activity.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{activity.description}</p>
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="text-card-foreground font-medium">
              {activity.completionAmount}/{activity.maxCompletionAmount}
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <span className="capitalize">{activity.frequency}</span>
          <span>{activity.visibleDays.join(", ")}</span>
        </div>
      </CardContent>
    </Card>
  )
}
