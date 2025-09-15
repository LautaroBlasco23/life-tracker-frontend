export interface UserStats {
  currentStreak: number
  longestStreak: number
  totalActivitiesCompleted: number
  totalFinancesTracked: number
  activitiesCompletedToday: number
  activitiesCreated: number
  financesThisMonth: number
  averageCompletionRate: number
  lastActivityDate: string | null
}

export interface DayStreak {
  date: string
  completed: boolean
  dayOfWeek: string
}
