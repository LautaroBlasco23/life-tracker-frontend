import type { User } from "@/models/user"

export class UserService {
  private static readonly MOCK_USER: User = {
    id: "1",
    firstName: "John",
    lastName: "Doe",
    username: "admin",
  }

  static async getCurrentUser(): Promise<User | null> {
    const token = localStorage.getItem("authToken")
    if (!token) return null

    await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate API delay
    return this.MOCK_USER
  }

  static async updateUser(updates: Partial<User>): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return { ...this.MOCK_USER, ...updates }
  }
}
