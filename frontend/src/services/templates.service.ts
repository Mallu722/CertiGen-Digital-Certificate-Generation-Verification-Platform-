import apiClient from '@/api/client';
import type { Template, PaginatedResponse } from '@/types';

export const templatesService = {
  async getAll(params?: { page?: number; search?: string; category?: number }): Promise<PaginatedResponse<Template>> {
    const response = await apiClient.get<PaginatedResponse<Template>>('/templates/', { params });
    return response.data;
  },

  async getById(id: string | number): Promise<Template> {
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

  async update(id: string | number, data: FormData | Partial<Template>): Promise<Template> {
    const isFormData = data instanceof FormData;
    const response = await apiClient.put<Template>(`/templates/${id}/`, data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });
    return response.data;
  },

  async delete(id: string | number): Promise<void> {
    await apiClient.delete(`/templates/${id}/`);
  },

  async unlock(id: string | number, password: string): Promise<{ status: string; message: string }> {
    const response = await apiClient.post<{ status: string; message: string }>(`/templates/${id}/unlock/`, { password });
    return response.data;
  }
};