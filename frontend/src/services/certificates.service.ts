import apiClient from '@/api/client';
import type { Certificate, PaginatedResponse } from '@/types';

export const certificatesService = {
  async getAll(params?: { page?: number; search?: string; status?: string }): Promise<PaginatedResponse<Certificate>> {
    const response = await apiClient.get<PaginatedResponse<Certificate>>('/certificates/', { params });
    return response.data;
  },

  async getById(id: string | number): Promise<Certificate> {
    const response = await apiClient.get<Certificate>(`/certificates/${id}/`);
    return response.data;
  },

  async create(data: {
    certificate_number: string;
    title: string;
    description: string;
    template: string | number;
    recipient_name: string;
    recipient_email: string;
  }): Promise<Certificate> {
    const response = await apiClient.post<Certificate>('/certificates/', data);
    return response.data;
  },

  async update(id: string | number, data: Partial<Certificate>): Promise<Certificate> {
    const response = await apiClient.put<Certificate>(`/certificates/${id}/`, data);
    return response.data;
  },

  async delete(id: string | number): Promise<void> {
    await apiClient.delete(`/certificates/${id}/`);
  },

  async verify(certificateId: string): Promise<{ certificate: Certificate; valid: boolean; verified_at: string }> {
    const response = await apiClient.get<{ certificate: Certificate; valid: boolean; verified_at: string }>(`/verify/${certificateId}/`);
    return response.data;
  }
};