import apiClient from '@/api/client';
import type { Template, PaginatedResponse } from '@/types';

export const templatesService = {
  async getAll(params?: { page?: number; search?: string; category?: number }): Promise<PaginatedResponse<Template>> {
    const response = await apiClient.get<PaginatedResponse<Template>>('/templates/', { params });
    return response.data;
  },

  async getById(id: number): Promise<Template> {
    const response = await apiClient.get<Template>(`/templates/${id}/`);
    return response.data;
  },

  async create(data: FormData): Promise<Template> {
    const response = await apiClient.post<Template>('/templates/', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async update(id: number, data: Partial<Template>): Promise<Template> {
    const response = await apiClient.put<Template>(`/templates/${id}/`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/templates/${id}/`);
  }
};