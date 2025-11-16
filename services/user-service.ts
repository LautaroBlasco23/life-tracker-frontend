import type { User } from '@/types/user';
import { authService } from './auth-service';
import { getConfig } from '@/lib/config';

interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  profilePicUrl?: string;
  email?: string;
}

interface ApiResponse<T> {
  message: string;
  data: T;
}

class UserService {
  private get baseUrl(): string {
    return getConfig().apiUrl;
  }

  async getUserById(id: number): Promise<User | null> {
    const response = await authService.makeAuthenticatedRequest(
      `${this.baseUrl}/users/${id}`
    );
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch user');
    }
    const result: ApiResponse<User> = await response.json();
    return result.data;
  }

  async updateUser(updates: UpdateUserRequest): Promise<User> {
    const response = await authService.makeAuthenticatedRequest(
      `${this.baseUrl}/users/profile`,
      {
        method: 'PUT',
        body: JSON.stringify(updates),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update user');
    }

    const result: ApiResponse<User> = await response.json();
    const updatedUser = result.data;

    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      const newUser = { ...currentUser, ...updatedUser };
      (authService as any).currentUser = newUser;
      if (typeof window !== 'undefined') {
        localStorage.setItem('currentUser', JSON.stringify(newUser));
      }
    }

    return updatedUser;
  }

  async uploadProfilePicture(file: File): Promise<User> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await authService.makeAuthenticatedRequest(
      `${this.baseUrl}/users/profile/image`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Failed to upload profile picture');
    }

    const result: ApiResponse<User> = await response.json();
    const updatedUser = result.data;

    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      const newUser = { ...currentUser, ...updatedUser };
      (authService as any).currentUser = newUser;
      if (typeof window !== 'undefined') {
        localStorage.setItem('currentUser', JSON.stringify(newUser));
      }
    }

    return updatedUser;
  }

  async deleteProfilePicture(): Promise<void> {
    const response = await authService.makeAuthenticatedRequest(
      `${this.baseUrl}/users/profile/image`,
      { method: 'DELETE' }
    );

    if (!response.ok) {
      throw new Error('Failed to delete profile picture');
    }

    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      const newUser = {
        ...currentUser,
        profilePicUrl: null,
        thumbnailUrl: null,
      };
      (authService as any).currentUser = newUser;
      if (typeof window !== 'undefined') {
        localStorage.setItem('currentUser', JSON.stringify(newUser));
      }
    }
  }

  async getAllUsers(): Promise<User[]> {
    const response = await authService.makeAuthenticatedRequest(
      `${this.baseUrl}/users`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    const result: ApiResponse<User[]> & { count: number } =
      await response.json();
    return result.data;
  }

  async deleteUser(id: number): Promise<void> {
    const response = await authService.makeAuthenticatedRequest(
      `${this.baseUrl}/users/${id}`,
      {
        method: 'DELETE',
      }
    );
    if (!response.ok) {
      throw new Error('Failed to delete user');
    }
  }
}

export const userService = new UserService();
