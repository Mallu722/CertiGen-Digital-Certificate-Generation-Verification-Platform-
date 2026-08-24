import apiClient from '@/api/client';
import type { Category, PaginatedResponse } from '@/types';

export const categoriesService = {
  async getAll(params?: { page?: number; search?: string }): Promise<PaginatedResponse<Category>> {
    const response = await apiClient.get<PaginatedResponse<Category>>('/categories/', { params });
    return response.data;
  },

  async getById(id: number): Promise<Category> {
    const response = await apiClient.get<Category>(`/categories/${id}/`);
    return response.data;
  },

  async create(data: { name: string; description: string }): Promise<Category> {
    const response = await apiClient.post<Category>('/categories/', data);
    return response.data;
  },

  async update(id: number, data: Partial<Category>): Promise<Category> {
    const response = await apiClient.put<Category>(`/categories/${id}/`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/categories/${id}/`);
  }
};