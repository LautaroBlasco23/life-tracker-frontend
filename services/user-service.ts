import type { User } from "@/types/user"
import { authService } from "./auth-service"

interface UpdateUserRequest {
  firstName?: string
  lastName?: string
  profilePicUrl?: string
  email?: string
}

class UserService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api-lifetracker.lautaroblasco.com/api'

  async getUserById(id: number): Promise<User | null> {
    const response = await authService.makeAuthenticatedRequest(`${this.baseUrl}/users/${id}`)

    if (!response.ok) {
      if (response.status === 404) return null
      throw new Error('Failed to fetch user')
    }

    return await response.json()
  }

  async updateUser(updates: UpdateUserRequest): Promise<User> {
    const response = await authService.makeAuthenticatedRequest(`${this.baseUrl}/users/profile`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })

    if (!response.ok) {
      throw new Error('Failed to update user')
    }

    const updatedUser = await response.json()

    // Update current user in auth service
    const currentUser = authService.getCurrentUser()
    if (currentUser) {
      const newUser = { ...currentUser, ...updatedUser }
        // Access private property - you might want to add a public method for this
        ; (authService as any).currentUser = newUser
      if (typeof window !== 'undefined') {
        localStorage.setItem('currentUser', JSON.stringify(newUser))
      }
    }

    return updatedUser
  }

  async uploadProfilePicture(file: File): Promise<string> {
    const formData = new FormData()
    formData.append('file', file)

    // TODO: fix this after implementing file upload in backend.
    const response = await authService.makeAuthenticatedRequest(`${this.baseUrl}/users/upload-profile-pic`, {
      method: 'POST',
      body: formData,
      headers: {},
    })

    if (!response.ok) {
      throw new Error('Failed to upload profile picture')
    }

    const result = await response.json()
    return result.url
  }

  async getAllUsers(): Promise<User[]> {
    const response = await authService.makeAuthenticatedRequest(`${this.baseUrl}/users`)

    if (!response.ok) {
      throw new Error('Failed to fetch users')
    }

    return await response.json()
  }

  async deleteUser(id: number): Promise<void> {
    const response = await authService.makeAuthenticatedRequest(`${this.baseUrl}/users/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error('Failed to delete user')
    }
  }
}

export const userService = new UserService()
