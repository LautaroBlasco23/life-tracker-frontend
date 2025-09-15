import type { Activity } from "../models/activity"

export class ActivityService {
  static generateId(): string {
    return Math.random().toString(36).substr(2, 9)
  }

  static createActivity(activityData: Omit<Activity, "id">): Activity {
    return {
      id: this.generateId(),
      ...activityData,
    }
  }

  static updateActivity(activities: Activity[], id: string, updates: Partial<Activity>): Activity[] {
    return activities.map((activity) => (activity.id === id ? { ...activity, ...updates } : activity))
  }

  static deleteActivity(activities: Activity[], id: string): Activity[] {
    return activities.filter((activity) => activity.id !== id)
  }

  static getActivityById(activities: Activity[], id: string): Activity | undefined {
    return activities.find((activity) => activity.id === id)
  }

  static getActivitiesByTimeGroup(activities: Activity[], timeGroup: Activity["timeGroup"]): Activity[] {
    return activities.filter((activity) => activity.timeGroup === timeGroup)
  }

  static incrementCompletion(activity: Activity): Activity {
    return {
      ...activity,
      completionAmount: Math.min(activity.completionAmount + 1, activity.maxCompletionAmount),
    }
  }

  static resetCompletion(activity: Activity): Activity {
    return {
      ...activity,
      completionAmount: 0,
    }
  }

  static getMockActivities(): Activity[] {
    return [
      {
        id: "1",
        title: "Morning Meditation",
        description: "10 minutes of mindfulness meditation to start the day",
        completionAmount: 0,
        maxCompletionAmount: 1,
        frequency: "daily",
        visibleDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        timeGroup: "morning",
      },
      {
        id: "2",
        title: "Drink Water",
        description: "Stay hydrated throughout the day",
        completionAmount: 2,
        maxCompletionAmount: 8,
        frequency: "daily",
        visibleDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        timeGroup: "morning",
      },
      {
        id: "3",
        title: "Exercise Routine",
        description: "30-minute workout session including cardio and strength training",
        completionAmount: 1,
        maxCompletionAmount: 1,
        frequency: "daily",
        visibleDays: ["Monday", "Wednesday", "Friday"],
        timeGroup: "morning",
      },
      {
        id: "4",
        title: "Team Standup",
        description: "Daily team synchronization meeting",
        completionAmount: 0,
        maxCompletionAmount: 1,
        frequency: "daily",
        visibleDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        timeGroup: "afternoon",
      },
      {
        id: "5",
        title: "Lunch Break Walk",
        description: "15-minute walk outside during lunch break",
        completionAmount: 1,
        maxCompletionAmount: 1,
        frequency: "daily",
        visibleDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        timeGroup: "afternoon",
      },
      {
        id: "6",
        title: "Reading Time",
        description: "30 minutes of reading personal development books",
        completionAmount: 0,
        maxCompletionAmount: 30,
        frequency: "daily",
        visibleDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        timeGroup: "evening",
      },
      {
        id: "7",
        title: "Plan Tomorrow",
        description: "Review today's accomplishments and plan tomorrow's priorities",
        completionAmount: 1,
        maxCompletionAmount: 1,
        frequency: "daily",
        visibleDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        timeGroup: "evening",
      },
    ]
  }
}
