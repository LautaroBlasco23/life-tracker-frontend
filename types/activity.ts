export type Frequency = "daily" | "weekly" | "monthly" | "oneTime"
export type DayOfWeek = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"
export type DayTime = "morning" | "afternoon" | "evening"

export interface Activity {
  id: number
  userId: number
  title: string
  description: string
  completionAmount: number
  frequency: Frequency
  dayFrequency?: string
  dayTime: DayTime
  isActive: boolean
  createdAt: string
  updatedAt: string
  todayCompletions: number
  isCompletedToday: boolean
}
