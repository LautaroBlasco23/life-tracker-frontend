import type { Activity, CreateActivityRequest, UpdateActivityRequest, ActivityRecord, ActivityStats, RecordActivityRequest, DayOfWeek } from "@/types"
import { authService } from "./auth-service"

interface CreateActivityPayload {
  title: string
  description: string
  completionAmount: number
  frequency: string
  dayFrequency?: string // JSON string in backend
  dayTime: string // Added dayTime field
}

interface UpdateActivityPayload {
  title?: string
  description?: string
  completionAmount?: number
  frequency?: string
  dayFrequency?: string
  dayTime?: string // Added dayTime field
  isActive?: boolean
}

// Backend response structure
interface BackendListResponse<T> {
  count: number
  data: T[] | null
  message: string
}

interface BackendSingleResponse<T> {
  data: T
  message: string
}

class ActivityService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api-lifetracker.lautaroblasco.com/api'

  async getActivitiesByUserId(): Promise<Activity[]> {
    const response = await authService.makeAuthenticatedRequest(`${this.baseUrl}/activities`)

    if (!response.ok) {
      throw new Error('Failed to fetch activities')
    }

    const backendResponse: BackendListResponse<Activity> = await response.json()

    // Return empty array if data is null, otherwise return the data array
    return backendResponse.data || []
  }

  async getActivity(id: number): Promise<Activity> {
    const response = await authService.makeAuthenticatedRequest(`${this.baseUrl}/activities/${id}`)

    if (!response.ok) {
      throw new Error('Activity not found')
    }

    const backendResponse: BackendSingleResponse<Activity> = await response.json()
    return backendResponse.data
  }

  async createActivity(activityData: CreateActivityRequest): Promise<Activity> {
    // Convert dayFrequency array to JSON string if present
    const payload: CreateActivityPayload = {
      title: activityData.title,
      description: activityData.description,
      completionAmount: activityData.completionAmount,
      frequency: activityData.frequency,
      dayFrequency: activityData.dayFrequency ? JSON.stringify(activityData.dayFrequency) : undefined,
      dayTime: activityData.dayTime, // Include dayTime
    }

    const response = await authService.makeAuthenticatedRequest(`${this.baseUrl}/activities`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error('Failed to create activity')
    }

    const backendResponse: BackendSingleResponse<Activity> = await response.json()
    return backendResponse.data
  }

  async updateActivity(id: number, updates: UpdateActivityRequest): Promise<Activity> {
    // Convert dayFrequency array to JSON string if present
    const payload: UpdateActivityPayload = {
      ...updates,
      dayFrequency: updates.dayFrequency ? JSON.stringify(updates.dayFrequency) : undefined,
      dayTime: updates.dayTime, // Include dayTime
    }

    const response = await authService.makeAuthenticatedRequest(`${this.baseUrl}/activities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error('Failed to update activity')
    }

    const backendResponse: BackendSingleResponse<Activity> = await response.json()
    return backendResponse.data
  }

  async deleteActivity(id: number): Promise<void> {
    const response = await authService.makeAuthenticatedRequest(`${this.baseUrl}/activities/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error('Failed to delete activity')
    }
  }

  async recordActivity(activityId: number, data: RecordActivityRequest = {}): Promise<ActivityRecord> {
    const response = await authService.makeAuthenticatedRequest(`${this.baseUrl}/activities/${activityId}/record`, {
      method: 'POST',
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error('Failed to record activity')
    }

    const backendResponse: BackendSingleResponse<ActivityRecord> = await response.json()
    return backendResponse.data
  }

  async getActivityRecords(activityId: number): Promise<ActivityRecord[]> {
    const response = await authService.makeAuthenticatedRequest(`${this.baseUrl}/activities/${activityId}/records`)

    if (!response.ok) {
      throw new Error('Failed to fetch activity records')
    }

    const backendResponse: BackendListResponse<ActivityRecord> = await response.json()
    return backendResponse.data || []
  }

  async getActivityStats(activityId: number): Promise<ActivityStats> {
    const response = await authService.makeAuthenticatedRequest(`${this.baseUrl}/activities/${activityId}/stats`)

    if (!response.ok) {
      throw new Error('Failed to fetch activity stats')
    }

    const backendResponse: BackendSingleResponse<ActivityStats> = await response.json()
    return backendResponse.data
  }

  async revertLastCompletion(activityId: number): Promise<void> {
    const response = await authService.makeAuthenticatedRequest(`${this.baseUrl}/activities/${activityId}/revert`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error('Failed to revert completion')
    }
  }

  // Legacy method - maps to recordActivity for backward compatibility
  async incrementActivityProgress(activityId: number): Promise<Activity> {
    await this.recordActivity(activityId)
    return this.getActivity(activityId)
  }

  // Helper method to parse dayFrequency from JSON string to array
  parseDayFrequency(dayFrequency?: string): DayOfWeek[] {
    if (!dayFrequency) return []
    try {
      return JSON.parse(dayFrequency)
    } catch {
      return []
    }
  }
}

export const activityService = new ActivityService()
