import api from './api';
import type {
  User,
  CreateUserRequest,
  LoginRequest,
  ApiResponse,
} from '@/types';

export const authService = {
  async register(
    data: CreateUserRequest
  ): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  async login(
    data: LoginRequest
  ): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  async getProfile(): Promise<ApiResponse<User>> {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  setToken(token: string): void {
    localStorage.setItem('token', token);
  },

  getUser(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  setUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  },
};
