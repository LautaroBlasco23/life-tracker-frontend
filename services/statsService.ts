import type { UserStats, DayStreak } from "@/models/stats"
import type { Activity } from "@/models/activity"
import type { Finance } from "@/models/finance"

export class StatsService {
  static calculateUserStats(activities: Activity[], finances: Finance[]): UserStats {
    const today = new Date().toISOString().split("T")[0]
    const currentMonth = new Date().getMonth()

    // Calculate activities completed today
    const activitiesCompletedToday = activities.filter(
      (activity) => activity.completionAmount >= activity.maxCompletionAmount,
    ).length

    // Calculate total activities completed
    const totalActivitiesCompleted = activities.filter(
      (activity) => activity.completionAmount >= activity.maxCompletionAmount,
    ).length

    // Calculate finances this month
    const financesThisMonth = finances.filter((finance) => new Date(finance.date).getMonth() === currentMonth).length

    // Calculate completion rate
    const averageCompletionRate = activities.length > 0 ? (totalActivitiesCompleted / activities.length) * 100 : 0

    // Mock streak calculation (in real app, this would use historical data)
    const currentStreak = Math.floor(Math.random() * 15) + 1
    const longestStreak = currentStreak + Math.floor(Math.random() * 10)

    return {
      currentStreak,
      longestStreak,
      totalActivitiesCompleted,
      totalFinancesTracked: finances.length,
      activitiesCompletedToday,
      activitiesCreated: activities.length,
      financesThisMonth,
      averageCompletionRate: Math.round(averageCompletionRate),
      lastActivityDate: activities.length > 0 ? today : null,
    }
  }

  static generateWeekStreak(): DayStreak[] {
    const days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]
    const today = new Date()
    const weekStreak: DayStreak[] = []

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)

      weekStreak.push({
        date: date.toISOString().split("T")[0],
        completed: Math.random() > 0.3, // Mock completion data
        dayOfWeek: days[date.getDay()],
      })
    }

    return weekStreak
  }
}
