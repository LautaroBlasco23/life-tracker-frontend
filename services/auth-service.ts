import type { User, LoginRequest, RegisterRequest, AuthResponse } from "@/types"

interface TokenResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
  tokenType: string
}

interface BackendAuthResponse {
  data: {
    tokens: TokenResponse
    user: User
  }
  message: string
}

interface RefreshRequest {
  refreshToken: string
}

class AuthService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'
  private currentUser: User | null = null
  private accessToken: string | null = null
  private refreshToken: string | null = null

  constructor() {
    // Load tokens from localStorage on initialization
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('accessToken')
      this.refreshToken = localStorage.getItem('refreshToken')
      const userData = localStorage.getItem('currentUser')
      if (userData) {
        try {
          this.currentUser = JSON.parse(userData)
        } catch (error) {
          console.error('Failed to parse user data from localStorage:', error)
          localStorage.removeItem('currentUser')
        }
      }
    }
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      throw new Error('Invalid credentials')
    }

    const backendResponse: BackendAuthResponse = await response.json()

    // Extract tokens and user from the nested structure
    const { tokens, user } = backendResponse.data

    // Store tokens and user
    this.accessToken = tokens.accessToken
    this.refreshToken = tokens.refreshToken
    this.currentUser = user

    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', tokens.accessToken)
      localStorage.setItem('refreshToken', tokens.refreshToken)
      localStorage.setItem('currentUser', JSON.stringify(user))
    }

    return {
      user: this.currentUser,
      token: this.accessToken,
    }
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(error || 'Registration failed')
    }

    const backendResponse: BackendAuthResponse = await response.json()

    // Extract tokens and user from the nested structure
    const { tokens, user } = backendResponse.data

    // Store tokens and user
    this.accessToken = tokens.accessToken
    this.refreshToken = tokens.refreshToken
    this.currentUser = user

    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', tokens.accessToken)
      localStorage.setItem('refreshToken', tokens.refreshToken)
      localStorage.setItem('currentUser', JSON.stringify(user))
    }

    return {
      user: this.currentUser,
      token: this.accessToken,
    }
  }

  async refreshAccessToken(): Promise<string> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await fetch(`${this.baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken: this.refreshToken }),
    })

    if (!response.ok) {
      // Refresh token is invalid, logout user
      await this.logout()
      throw new Error('Session expired')
    }

    // Assuming refresh endpoint also returns the same structure
    const backendResponse: BackendAuthResponse = await response.json()
    const { tokens } = backendResponse.data

    this.accessToken = tokens.accessToken
    this.refreshToken = tokens.refreshToken

    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', tokens.accessToken)
      localStorage.setItem('refreshToken', tokens.refreshToken)
    }

    return this.accessToken
  }

  async logout(): Promise<void> {
    this.currentUser = null
    this.accessToken = null
    this.refreshToken = null

    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('currentUser')
    }
  }

  getCurrentUser(): User | null {
    return this.currentUser
  }

  getToken(): string | null {
    return this.accessToken
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null && this.accessToken !== null
  }

  // Helper method for authenticated requests
  async makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`
    }

    let response = await fetch(url, {
      ...options,
      headers,
    })

    // If unauthorized and we have a refresh token, try to refresh
    if (response.status === 401 && this.refreshToken) {
      try {
        await this.refreshAccessToken()
        headers['Authorization'] = `Bearer ${this.accessToken}`
        response = await fetch(url, {
          ...options,
          headers,
        })
      } catch (error) {
        // Refresh failed, user needs to login again
        throw error
      }
    }

    return response
  }
}

export const authService = new AuthService()
