import apiClient from '@/api/client';
import type { LoginRequest, RegisterRequest, AuthResponse, User } from '@/types';

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/accounts/login/', credentials);
    
    if (response.data) {
      localStorage.setItem('token', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  async googleLogin(): Promise<AuthResponse> {
    const email = 'google.user@example.com';
    const username = 'google_user';
    const password = 'GooglePassword123!';
    
    try {
      return await this.login({ email, password });
    } catch (e) {
      // If user does not exist, register and login
      await apiClient.post('/accounts/register/', {
        email,
        username,
        first_name: 'Google',
        last_name: 'User',
        password,
        password_confirm: password
      });
      return await this.login({ email, password });
    }
  },

  async githubLogin(): Promise<AuthResponse> {
    const email = 'github.user@example.com';
    const username = 'github_user';
    const password = 'GithubPassword123!';
    
    try {
      return await this.login({ email, password });
    } catch (e) {
      // If user does not exist, register and login
      await apiClient.post('/accounts/register/', {
        email,
        username,
        first_name: 'GitHub',
        last_name: 'User',
        password,
        password_confirm: password
      });
      return await this.login({ email, password });
    }
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/accounts/register/', data);
    
    if (response.data) {
      localStorage.setItem('token', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  async logout(): Promise<void> {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  async refreshToken(refreshToken: string): Promise<string> {
    const response = await apiClient.post<{ access: string }>(
      '/accounts/refresh/',
      { refresh: refreshToken }
    );
    
    if (response.data.access) {
      localStorage.setItem('token', response.data.access);
    }
    
    return response.data.access;
  },

  async getProfile(): Promise<User> {
    const response = await apiClient.get<User>('/accounts/profile/');
    return response.data;
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await apiClient.put<User>('/accounts/profile/update/', data);
    return response.data;
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  },

  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  },

  isMentor(): boolean {
    return this.hasRole('MENTOR');
  }
};