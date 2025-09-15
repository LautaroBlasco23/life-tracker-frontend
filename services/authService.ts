export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterData {
  firstName: string
  lastName: string
  username: string
  password: string
}

export interface AuthResponse {
  success: boolean
  token?: string
  message?: string
}

export class AuthService {
  private static readonly MOCK_TOKEN = "mock-jwt-token-12345"
  private static readonly MOCK_USER = {
    username: "admin",
    password: "password123",
  }

  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API delay

    if (credentials.username === this.MOCK_USER.username && credentials.password === this.MOCK_USER.password) {
      localStorage.setItem("authToken", this.MOCK_TOKEN)
      return {
        success: true,
        token: this.MOCK_TOKEN,
      }
    }

    return {
      success: false,
      message: "Invalid credentials",
    }
  }

  static async register(data: RegisterData): Promise<AuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API delay

    localStorage.setItem("authToken", this.MOCK_TOKEN)
    return {
      success: true,
      token: this.MOCK_TOKEN,
    }
  }

  static logout(): void {
    localStorage.removeItem("authToken")
  }

  static getToken(): string | null {
    return localStorage.getItem("authToken")
  }

  static isAuthenticated(): boolean {
    return !!this.getToken()
  }
}
