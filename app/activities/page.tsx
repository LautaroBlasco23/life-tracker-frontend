"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AuthGuard } from "@/components/auth-guard"
import { Navigation } from "@/components/navigation"
import { ActivityCard } from "@/components/activity/activity-card"
import { CreateActivityModal } from "@/components/activity/create-activity-modal"
import { EditActivityModal } from "@/components/activity/edit-activity-modal"
import { ThemeToggle } from "@/components/theme-toggle"
import { activityService } from "@/services/activity-service"
import { useToast } from "@/hooks/use-toast"
import type { Activity, DayTime } from "@/types/activity"
import { Plus, Sun, CloudSun, Moon } from "lucide-react"

const CATEGORY_CONFIG = {
  morning: {
    label: "Morning",
    icon: Sun,
    description: "Start your day right",
    accentColor: "border-amber-400",
    iconColor: "text-amber-500",
  },
  afternoon: {
    label: "Afternoon",
    icon: CloudSun,
    description: "Keep the momentum going",
    accentColor: "border-sky-400",
    iconColor: "text-sky-500",
  },
  evening: {
    label: "Evening",
    icon: Moon,
    description: "Wind down and reflect",
    accentColor: "border-indigo-400",
    iconColor: "text-indigo-500",
  },
} as const

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadActivities()
  }, [])

  const loadActivities = async () => {
    try {
      setIsLoading(true)
      const userActivities = await activityService.getActivitiesByUserId()
      setActivities(userActivities)
    } catch (error) {
      console.error('Failed to load activities:', error)
      toast({
        title: "Failed to load activities",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteActivity = async (activityId: number) => {
    try {
      await activityService.deleteActivity(activityId)
      setActivities(activities.filter((activity) => activity.id !== activityId))
      toast({
        title: "Activity deleted",
        description: "The activity has been successfully deleted.",
      })
    } catch (error) {
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    }
  }

  const handleActivityCreated = (newActivity: Activity) => {
    setActivities([newActivity, ...activities])
    setShowCreateModal(false)
  }

  const handleActivityUpdated = (updatedActivity: Activity) => {
    setActivities(activities.map((activity) => (activity.id === updatedActivity.id ? updatedActivity : activity)))
    setShowEditModal(false)
    setEditingActivity(null)
  }

  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity)
    setShowEditModal(true)
  }

  const handleProgressUpdate = (updatedActivity: Activity) => {
    setActivities(activities.map((activity) => (activity.id === updatedActivity.id ? updatedActivity : activity)))
  }

  const activitiesByCategory = activities.reduce(
    (acc, activity) => {
      const dayTime = activity.dayTime
      if (!acc[dayTime]) {
        acc[dayTime] = []
      }
      acc[dayTime].push(activity)
      return acc
    },
    {} as Record<DayTime, Activity[]>,
  )

  if (isLoading) {
    return (
      <AuthGuard>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-muted-foreground">Loading activities...</div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background pb-20">
        <Navigation />
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-semibold text-foreground mb-2">Activities</h1>
              <p className="text-muted-foreground">Track and manage your daily activities by time of day</p>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Activity
              </Button>
            </div>
          </div>

          {activities.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <div className="text-muted-foreground mb-4">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <Plus className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">No activities yet</h3>
                  <p>Get started by creating your first activity to track.</p>
                </div>
                <Button onClick={() => setShowCreateModal(true)}>Create your first activity</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              {(Object.keys(CATEGORY_CONFIG) as DayTime[]).map((dayTime) => {
                const categoryActivities = activitiesByCategory[dayTime] || []
                const config = CATEGORY_CONFIG[dayTime]
                const IconComponent = config.icon

                if (categoryActivities.length === 0) return null

                return (
                  <div key={dayTime} className="space-y-4">
                    <div className={`flex items-center gap-4 py-4 border-l-4 ${config.accentColor} pl-4`}>
                      <IconComponent className={`h-6 w-6 ${config.iconColor}`} />
                      <div className="flex-1">
                        <h2 className="text-xl font-semibold text-foreground">{config.label}</h2>
                        <p className="text-sm text-muted-foreground">{config.description}</p>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {categoryActivities.length} {categoryActivities.length === 1 ? "activity" : "activities"}
                      </span>
                    </div>

                    <div className="space-y-4">
                      {categoryActivities.map((activity) => (
                        <ActivityCard
                          key={activity.id}
                          activity={activity}
                          onDelete={() => handleDeleteActivity(activity.id)}
                          onEdit={() => handleEditActivity(activity)}
                          onProgressUpdate={handleProgressUpdate}
                        />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <CreateActivityModal
            open={showCreateModal}
            onOpenChange={setShowCreateModal}
            onActivityCreated={handleActivityCreated}
          />

          <EditActivityModal
            open={showEditModal}
            onOpenChange={setShowEditModal}
            activity={editingActivity}
            onActivityUpdated={handleActivityUpdated}
          />
        </div>
      </div>
    </AuthGuard>
  )
}
