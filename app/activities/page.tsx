"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { BottomNavigation } from "@/components/BottomNavigation"
import { TimeGroupSection } from "@/components/TimeGroupSection"
import { NewActivityModal } from "@/components/NewActivityModal"
import { Button } from "@/components/ui/button"
import { useAppContext } from "@/context/AppContext"
import { TIME_GROUPS } from "@/constants"
import { DayStreakComponent } from "@/components/DayStreak"
import { StatsService } from "@/services/statsService"

export default function ActivitiesPage() {
  const { state, dispatch } = useAppContext()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const weekStreak = StatsService.generateWeekStreak()

  const groupedActivities = TIME_GROUPS.reduce(
    (acc, timeGroup) => {
      acc[timeGroup] = state.activities.filter((activity) => activity.timeGroup === timeGroup)
      return acc
    },
    {} as Record<string, typeof state.activities>,
  )

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground">Activities</h1>
          <Button
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={16} className="mr-1" />
            Add Activity
          </Button>
        </div>

        <div className="mb-6">
          <DayStreakComponent streak={weekStreak} />
        </div>

        <div className="space-y-8">
          {TIME_GROUPS.map((timeGroup) => (
            <TimeGroupSection key={timeGroup} timeGroup={timeGroup} activities={groupedActivities[timeGroup] || []} />
          ))}
        </div>

        {state.activities.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No activities yet</p>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus size={16} className="mr-2" />
              Create Your First Activity
            </Button>
          </div>
        )}
      </div>
      <BottomNavigation />
      <NewActivityModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  )
}
