export interface Activity {
  id: string
  title: string
  description: string
  completionAmount: number
  maxCompletionAmount: number
  frequency: "daily" | "weekly" | "monthly" | "specific days"
  visibleDays: string[]
  timeGroup: "morning" | "afternoon" | "evening"
}
