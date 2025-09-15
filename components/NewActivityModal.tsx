"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Minus } from "lucide-react"
import { useAppContext } from "@/context/AppContext"
import { DAYS_OF_WEEK, FREQUENCY_OPTIONS, TIME_GROUPS } from "@/constants"
import type { Activity } from "@/models"

interface NewActivityModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface ActivityFormData {
  title: string
  description: string
  frequency: "daily" | "weekly" | "monthly" | "specific days"
  timeGroup: "morning" | "afternoon" | "evening"
  visibleDays: string[]
  maxCompletionAmount: number
}

export function NewActivityModal({ open, onOpenChange }: NewActivityModalProps) {
  const { dispatch } = useAppContext()
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [selectedFrequency, setSelectedFrequency] = useState<"daily" | "weekly" | "monthly" | "specific days">("daily")
  const [selectedTimeGroup, setSelectedTimeGroup] = useState<"morning" | "afternoon" | "evening">("morning")
  const [completionAmount, setCompletionAmount] = useState(1)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ActivityFormData>({
    defaultValues: {
      title: "",
      description: "",
      frequency: "daily",
      timeGroup: "morning",
      visibleDays: [],
      maxCompletionAmount: 1,
    },
  })

  const handleDayToggle = (day: string) => {
    const updatedDays = selectedDays.includes(day) ? selectedDays.filter((d) => d !== day) : [...selectedDays, day]
    setSelectedDays(updatedDays)
    setValue("visibleDays", updatedDays)
  }

  const handleFrequencySelect = (frequency: "daily" | "weekly" | "monthly" | "specific days") => {
    setSelectedFrequency(frequency)
    setValue("frequency", frequency)

    if (frequency === "daily") {
      const allDays = DAYS_OF_WEEK
      setSelectedDays(allDays)
      setValue("visibleDays", allDays)
    } else if (frequency !== "specific days") {
      setSelectedDays([])
      setValue("visibleDays", [])
    }
  }

  const handleTimeGroupSelect = (timeGroup: "morning" | "afternoon" | "evening") => {
    setSelectedTimeGroup(timeGroup)
    setValue("timeGroup", timeGroup)
  }

  const incrementCompletion = () => {
    const newAmount = completionAmount + 1
    setCompletionAmount(newAmount)
    setValue("maxCompletionAmount", newAmount)
  }

  const decrementCompletion = () => {
    if (completionAmount > 1) {
      const newAmount = completionAmount - 1
      setCompletionAmount(newAmount)
      setValue("maxCompletionAmount", newAmount)
    }
  }

  const onSubmit = (data: ActivityFormData) => {
    const newActivity: Activity = {
      id: Date.now().toString(),
      title: data.title,
      description: data.description,
      completionAmount: 0,
      maxCompletionAmount: completionAmount,
      frequency: selectedFrequency,
      timeGroup: selectedTimeGroup,
      visibleDays: selectedDays,
    }

    dispatch({ type: "ADD_ACTIVITY", payload: newActivity })
    reset()
    setSelectedDays([])
    setSelectedFrequency("daily")
    setSelectedTimeGroup("morning")
    setCompletionAmount(1)
    onOpenChange(false)
  }

  const handleClose = () => {
    reset()
    setSelectedDays([])
    setSelectedFrequency("daily")
    setSelectedTimeGroup("morning")
    setCompletionAmount(1)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Activity</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              {...register("title", { required: "Title is required" })}
              placeholder="Enter activity title"
            />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description", { required: "Description is required" })}
              placeholder="Enter activity description"
              rows={3}
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Frequency</Label>
            <div className="grid grid-cols-2 gap-2">
              {[...FREQUENCY_OPTIONS, "specific days"].map((freq) => (
                <Button
                  key={freq}
                  type="button"
                  variant={selectedFrequency === freq ? "default" : "outline"}
                  onClick={() => handleFrequencySelect(freq as any)}
                  className="justify-center"
                >
                  {freq.charAt(0).toUpperCase() + freq.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Time Group</Label>
            <div className="grid grid-cols-3 gap-2">
              {TIME_GROUPS.map((time) => (
                <Button
                  key={time}
                  type="button"
                  variant={selectedTimeGroup === time ? "default" : "outline"}
                  onClick={() => handleTimeGroupSelect(time)}
                  className="justify-center"
                >
                  {time.charAt(0).toUpperCase() + time.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Completion Amount</Label>
            <div className="flex items-center justify-center space-x-4">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={decrementCompletion}
                disabled={completionAmount <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-lg font-semibold min-w-[2rem] text-center">{completionAmount}</span>
              <Button type="button" variant="outline" size="icon" onClick={incrementCompletion}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {selectedFrequency === "specific days" && (
            <div className="space-y-2">
              <Label>Visible Days</Label>
              <div className="grid grid-cols-2 gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <div key={day} className="flex items-center space-x-2">
                    <Checkbox
                      id={day}
                      checked={selectedDays.includes(day)}
                      onCheckedChange={() => handleDayToggle(day)}
                    />
                    <Label htmlFor={day} className="text-sm font-normal">
                      {day}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Create Activity
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
