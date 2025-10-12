import type {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
} from '@/types';

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

interface BackendAuthResponse {
  data: {
    tokens: TokenResponse;
    user: User;
  };
  message: string;
}

interface BackendErrorResponse {
  error: string;
  details?: string;
}

class AuthService {
  private baseUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    'https://api-lifetracker.lautaroblasco.com/api';
  private currentUser: User | null = null;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('accessToken');
      this.refreshToken = localStorage.getItem('refreshToken');
      const userData = localStorage.getItem('currentUser');
      if (userData) {
        try {
          this.currentUser = JSON.parse(userData);
        } catch (error) {
          console.error('Failed to parse user data from localStorage:', error);
          localStorage.removeItem('currentUser');
        }
      }
    }
  }

  private async handleErrorResponse(response: Response): Promise<never> {
    let errorMessage = 'An unexpected error occurred';

    try {
      const errorData: BackendErrorResponse = await response.json();

      if (errorData.error === 'user already exists') {
        errorMessage = 'An account with this email already exists';
      } else if (errorData.error === 'invalid credentials') {
        errorMessage = 'Invalid email or password';
      } else if (
        errorData.details?.includes("'Password' failed on the 'min' tag")
      ) {
        errorMessage = 'Password must be at least 8 characters long';
      } else if (errorData.error) {
        errorMessage = errorData.error;
      } else if (errorData.details) {
        errorMessage = errorData.details;
      }
    } catch {
      errorMessage = `Request failed with status ${response.status}`;
    }

    throw new Error(errorMessage);
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      await this.handleErrorResponse(response);
    }

    const backendResponse: BackendAuthResponse = await response.json();
    const { tokens, user } = backendResponse.data;

    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;
    this.currentUser = user;

    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      localStorage.setItem('currentUser', JSON.stringify(user));
    }

    return {
      user: this.currentUser,
      token: this.accessToken,
    };
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      await this.handleErrorResponse(response);
    }

    const backendResponse: BackendAuthResponse = await response.json();
    const { tokens, user } = backendResponse.data;

    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;
    this.currentUser = user;

    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      localStorage.setItem('currentUser', JSON.stringify(user));
    }

    return {
      user: this.currentUser,
      token: this.accessToken,
    };
  }

  async refreshAccessToken(): Promise<string> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${this.baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken: this.refreshToken }),
    });

    if (!response.ok) {
      await this.logout();
      throw new Error('Session expired');
    }

    const backendResponse: BackendAuthResponse = await response.json();
    const { tokens } = backendResponse.data;

    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;

    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
    }

    return this.accessToken;
  }

  async logout(): Promise<void> {
    this.currentUser = null;
    this.accessToken = null;
    this.refreshToken = null;

    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('currentUser');
    }
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  getToken(): string | null {
    return this.accessToken;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null && this.accessToken !== null;
  }

  async makeAuthenticatedRequest(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    let response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401 && this.refreshToken) {
      try {
        await this.refreshAccessToken();
        headers['Authorization'] = `Bearer ${this.accessToken}`;
        response = await fetch(url, {
          ...options,
          headers,
        });
      } catch (error) {
        throw error;
      }
    }

    return response;
  }
}

export const authService = new AuthService();
