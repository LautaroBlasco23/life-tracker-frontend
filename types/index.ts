export type Frequency = "daily" | "weekly" | "monthly" | "oneTime"
export type DayOfWeek = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"
export type DayTime = "morning" | "afternoon" | "evening"

// User types (matches Go UserResponse)
export interface User {
  id: number
  firstName: string
  lastName: string
  email: string
  profilePicUrl?: string
  createdAt: string
  updatedAt: string
}

// Activity types (matches Go ActivityResponse)
export interface Activity {
  id: number
  userId: number
  title: string
  description: string
  completionAmount: number
  frequency: Frequency
  dayFrequency?: string // JSON string in backend, not array
  dayTime: DayTime
  isActive: boolean
  createdAt: string
  updatedAt: string
  // New fields for today's completion status
  todayCompletions: number
  isCompletedToday: boolean
}

// Request/Response types for API
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  firstName: string
  lastName: string
  email: string
  password: string
}

export interface CreateActivityRequest {
  title: string
  description: string
  completionAmount: number
  frequency: Frequency
  dayFrequency?: DayOfWeek[] // Array in frontend, converted to JSON string for backend
  dayTime: DayTime
}

export interface UpdateActivityRequest {
  title?: string
  description?: string
  completionAmount?: number
  frequency?: Frequency
  dayFrequency?: DayOfWeek[]
  dayTime?: DayTime
  isActive?: boolean
}

export interface AuthResponse {
  user: User
  token: string
}

// Token response from backend
export interface TokenResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
  tokenType: string
}

// Activity record types (matches Go DTOs)
export interface ActivityRecord {
  id: string
  activityId: number
  userId: number
  completionDate: string
  notes?: string
  createdAt: string
}

export interface RecordActivityRequest {
  completionDate?: string
  notes?: string
}

export interface ActivityStats {
  activityId: number
  title: string
  totalCompletions: number
  currentStreak: number
  longestStreak: number
  completionRate: number
  recentRecords: ActivityRecord[]
}
