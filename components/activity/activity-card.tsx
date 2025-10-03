"use client"

import React, { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  MoreHorizontal,
  Trash2,
  Edit,
  Calendar,
  Target,
  Plus,
  Undo2
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { activityService } from "@/services/activity-service"
import { DeleteActivityModal } from "@/components/activity/delete-activity-modal"
import type { Activity, DayOfWeek } from "@/types/activity"

interface ActivityCardProps {
  activity: Activity
  onDelete: () => void
  onEdit: () => void
  onProgressUpdate: (updatedActivity: Activity) => void
}

// Custom Dropdown Component
const CustomDropdown = ({ children, trigger, align = "end" }: {
  children: React.ReactNode
  trigger: React.ReactNode
  align?: "start" | "end"
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsOpen(!isOpen)
  }

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        onClick={handleTriggerClick}
        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8"
      >
        {trigger}
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className={`absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 ${align === 'end' ? 'right-0' : 'left-0'
            }`}
          style={{ top: '100%', marginTop: '4px' }}
        >
          <div onClick={() => setIsOpen(false)}>
            {children}
          </div>
        </div>
      )}
    </div>
  )
}

const DropdownMenuItem = ({
  children,
  onClick,
  variant = "default",
  disabled = false
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: "default" | "destructive"
  disabled?: boolean
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled && onClick) {
      onClick()
    }
  }

  return (
    <div
      className={`relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors ${disabled
        ? 'pointer-events-none opacity-50'
        : variant === 'destructive'
          ? 'text-red-600 focus:bg-red-50 focus:text-red-600 hover:bg-red-50'
          : 'focus:bg-accent focus:text-accent-foreground hover:bg-accent'
        }`}
      onClick={handleClick}
    >
      {children}
    </div>
  )
}

export function ActivityCard({ activity, onDelete, onEdit, onProgressUpdate }: ActivityCardProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isReverting, setIsReverting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const { toast } = useToast()

  const handleDeleteClick = () => {
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = async () => {
    await onDelete()
  }

  const handleRevertCompletion = async () => {
    setIsReverting(true)

    // Optimistically update the UI
    const newCompletions = Math.max(0, activity.todayCompletions - 1)
    const optimisticActivity: Activity = {
      ...activity,
      todayCompletions: newCompletions,
      isCompletedToday: newCompletions >= activity.completionAmount
    }
    onProgressUpdate(optimisticActivity)

    try {
      // Revert the activity completion
      await activityService.revertLastCompletion(activity.id)

      toast({
        title: "Completion Reverted",
        description: `Removed one completion from "${activity.title}".`,
        variant: "default",
      })
    } catch (error) {
      // Revert the optimistic update on error
      onProgressUpdate(activity)

      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to revert completion",
        variant: "destructive",
      })
    } finally {
      setIsReverting(false)
    }
  }

  const handleCardClick = async (e: React.MouseEvent) => {
    // More specific check for dropdown elements
    const target = e.target as HTMLElement
    const isDropdownElement = target.closest('[data-dropdown]') ||
      target.closest('button') ||
      target.tagName === 'BUTTON'

    if (isDropdownElement) {
      return
    }

    if (activity.isCompletedToday) {
      toast({
        title: "Activity Complete",
        description: "This activity is already completed for today!",
        variant: "default",
      })
      return
    }

    await handleRecordCompletion()
  }

  const handleRecordCompletion = async () => {
    setIsRecording(true)

    // Optimistically update the UI
    const optimisticActivity: Activity = {
      ...activity,
      todayCompletions: activity.todayCompletions + 1,
      isCompletedToday: (activity.todayCompletions + 1) >= activity.completionAmount
    }
    onProgressUpdate(optimisticActivity)

    try {
      // Record the activity completion
      await activityService.recordActivity(activity.id)

      const isNowCompleted = optimisticActivity.isCompletedToday
      toast({
        title: isNowCompleted ? "Activity Completed!" : "Progress Updated",
        description: isNowCompleted
          ? `Great job! You've completed "${activity.title}" for today.`
          : `Progress: ${optimisticActivity.todayCompletions}/${optimisticActivity.completionAmount}`,
        variant: "default",
      })
    } catch (error) {
      // Revert the optimistic update on error
      onProgressUpdate(activity)

      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to record completion",
        variant: "destructive",
      })
    } finally {
      setIsRecording(false)
    }
  }

  const getFrequencyBadgeVariant = (frequency: string) => {
    switch (frequency) {
      case "daily":
        return "default"
      case "weekly":
        return "secondary"
      case "monthly":
        return "outline"
      case "oneTime":
        return "destructive"
      default:
        return "default"
    }
  }

  const getDayTimeBadgeVariant = (dayTime: string) => {
    switch (dayTime) {
      case "morning":
        return "default"
      case "afternoon":
        return "secondary"
      case "evening":
        return "outline"
      default:
        return "default"
    }
  }

  const formatDayFrequency = (dayFrequency?: string) => {
    if (!dayFrequency) return null
    try {
      const days: DayOfWeek[] = JSON.parse(dayFrequency)
      return days.map((day) => day.charAt(0).toUpperCase() + day.slice(1)).join(", ")
    } catch {
      return null
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const progressPercentage = (activity.todayCompletions / activity.completionAmount) * 100
  const isCompleted = activity.isCompletedToday

  return (
    <>
      <Card
        className={`transition-all duration-200 ${isCompleted
          ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
          : "hover:shadow-md cursor-pointer hover:scale-[1.02]"
          } ${isRecording || isReverting ? "opacity-70" : ""}`}
        onClick={handleCardClick}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle
                  className={`text-lg font-medium ${isCompleted ? "text-green-700 dark:text-green-300" : "text-foreground"}`}
                >
                  {activity.title}
                </CardTitle>
                {isCompleted && (
                  <Badge
                    variant="default"
                    className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  >
                    Complete
                  </Badge>
                )}
              </div>
              {activity.description && (
                <CardDescription className="mt-1 text-muted-foreground">{activity.description}</CardDescription>
              )}
            </div>

            <div data-dropdown>
              <CustomDropdown
                trigger={
                  <>
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </>
                }
                align="end"
              >
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                {activity.todayCompletions > 0 && (
                  <DropdownMenuItem onClick={handleRevertCompletion} disabled={isReverting}>
                    <Undo2 className="h-4 w-4 mr-2" />
                    {isReverting ? "Reverting..." : "Revert Last"}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleDeleteClick} variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </CustomDropdown>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">
                Today's Progress: {activity.todayCompletions}/{activity.completionAmount}
              </span>
              {!isCompleted && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Plus className="h-3 w-3" />
                  <span>Click to record</span>
                </div>
              )}
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Target className="h-4 w-4" />
                <span>{activity.completionAmount}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Created {formatDate(activity.createdAt)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={getDayTimeBadgeVariant(activity.dayTime)}>{activity.dayTime}</Badge>
              <Badge variant={getFrequencyBadgeVariant(activity.frequency)}>{activity.frequency}</Badge>
              {activity.frequency === "weekly" && formatDayFrequency(activity.dayFrequency) && (
                <Badge variant="outline" className="text-xs">
                  {formatDayFrequency(activity.dayFrequency)}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      <DeleteActivityModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        activity={activity}
        onConfirmDelete={handleConfirmDelete}
      />
    </>
  )
}
