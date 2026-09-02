import apiClient from '@/api/client';
import type { Certificate, PaginatedResponse, VerificationResponse } from '@/types';

export const certificatesService = {
  async getAll(params?: { page?: number; search?: string; status?: string }): Promise<PaginatedResponse<Certificate>> {
    const response = await apiClient.get<PaginatedResponse<Certificate>>('/certificates/', { params });
    return response.data;
  },

  async getById(id: string | number): Promise<Certificate> {
    const response = await apiClient.get<Certificate>(`/certificates/${id}/`);
    return response.data;
  },

  async getNextNumber(): Promise<{ next_number: string }> {
    const response = await apiClient.get<{ next_number: string }>('/certificates/next-id/');
    return response.data;
  },

  async create(data: {
    certificate_number?: string;
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

  async verify(certificateId: string): Promise<VerificationResponse> {
    const response = await apiClient.get<VerificationResponse>(`/verify/${encodeURIComponent(certificateId)}/`);
    return response.data;
  },

  async revoke(id: string | number, reason?: string): Promise<{ message: string; certificate: Certificate }> {
    const response = await apiClient.post<{ message: string; certificate: Certificate }>(`/certificates/${id}/revoke/`, {
      reason: reason || 'Revoked by authority'
    });
    return response.data;
  },

  async reactivate(id: string | number): Promise<{ message: string; certificate: Certificate }> {
    const response = await apiClient.post<{ message: string; certificate: Certificate }>(`/certificates/${id}/reactivate/`);
    return response.data;
  },

  async downloadPdf(id: string | number, filename?: string): Promise<void> {
    const response = await apiClient.get(`/certificates/${id}/download/`, {
      responseType: 'blob'
    });
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `certificate-${id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  async parseSheet(file: File): Promise<{ count: number; filename: string; recipients: any[] }> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/certificates/parse-sheet/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  async bulkIssue(payload: any): Promise<{
    batch_id: string;
    total_issued: number;
    emails_sent: number;
    zip_filename: string;
    zip_relative_url: string;
    certificates: any[];
    errors: string[];
  }> {
    const isFormData = payload instanceof FormData;
    const response = await apiClient.post('/certificates/bulk-issue/', payload, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined
    });
    return response.data;
  },

  async downloadBatchZip(zipFilename: string): Promise<void> {
    const response = await apiClient.get('/certificates/download-batch-zip/', {
      params: { filename: zipFilename },
      responseType: 'blob'
    });
    const blob = new Blob([response.data], { type: 'application/zip' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = zipFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
};
