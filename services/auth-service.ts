import { getConfig } from '@/lib/config';
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

type AuthChangeCallback = (isAuthenticated: boolean) => void;

function getBrowserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'UTC';
  }
}

class AuthService {
  private get baseUrl(): string {
    return getConfig().apiUrl;
  }
  private currentUser: User | null = null;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private authChangeCallbacks: Set<AuthChangeCallback> = new Set();

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

  onAuthChange(callback: AuthChangeCallback): () => void {
    this.authChangeCallbacks.add(callback);
    return () => {
      this.authChangeCallbacks.delete(callback);
    };
  }

  private notifyAuthChange(isAuthenticated: boolean): void {
    this.authChangeCallbacks.forEach((callback) => callback(isAuthenticated));
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
        'X-Timezone': getBrowserTimezone(),
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

    this.notifyAuthChange(true);

    return {
      user: this.currentUser,
      token: this.accessToken,
    };
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const timezone = getBrowserTimezone();

    const response = await fetch(`${this.baseUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Timezone': timezone,
      },
      body: JSON.stringify({
        ...userData,
        timezone,
      }),
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

    this.notifyAuthChange(true);

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

    this.notifyAuthChange(false);
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
    if (!this.accessToken && this.refreshToken) {
      try {
        await this.refreshAccessToken();
      } catch {
        await this.logout();
        throw new Error('Session expired');
      }
    }

    if (!this.accessToken) {
      await this.logout();
      throw new Error('Not authenticated');
    }

    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    headers['Authorization'] = `Bearer ${this.accessToken}`;
    headers['X-Timezone'] = getBrowserTimezone();

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

        if (response.status === 401) {
          await this.logout();
        }
      } catch {
        await this.logout();
      }
    }

    return response;
  }
}

export const authService = new AuthService();
