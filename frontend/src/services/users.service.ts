import apiClient from '@/api/client';
import type { User, PaginatedResponse } from '@/types';

export type UserAdmin = User;

export const usersService = {
  async getAll(params?: { page?: number; search?: string }): Promise<PaginatedResponse<User>> {
    const response = await apiClient.get<PaginatedResponse<User>>('/accounts/', { params });
    return response.data;
  },

  async getById(id: string): Promise<User> {
    const response = await apiClient.get<User>(`/accounts/${id}/`);
    return response.data;
  },

  async update(id: string, data: Partial<User>): Promise<User> {
    const response = await apiClient.patch<User>(`/accounts/${id}/`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/accounts/${id}/`);
  }
};