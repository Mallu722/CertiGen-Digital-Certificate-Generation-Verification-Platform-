import apiClient from '@/api/client';
import type { User } from '@/types';

export interface TemplateUsageStat {
  id: string;
  name: string;
  category_name: string;
  is_private: boolean;
  is_active: boolean;
  usage_count: number;
  primary_color: string;
  secondary_color: string;
}

export interface CategorySummary {
  id: string;
  name: string;
  description: string;
  templates_count: number;
}

export interface AdminAnalyticsData {
  total_visits: number;
  unique_visitors: number;
  visits_last_24h: number;
  visits_last_7d: number;
  total_website_visits: number;
  page_visits: number;
  verification_inquiries: number;
  total_certificates: number;
  valid_certificates: number;
  revoked_certificates: number;
  total_users: number;
  mentors_count: number;
  admins_count: number;
  template_usage: TemplateUsageStat[];
  users: User[];
  categories: CategorySummary[];
}

export const analyticsService = {
  async recordVisit(path: string = window.location.pathname): Promise<void> {
    try {
      await apiClient.post('/analytics/visit/', { path });
    } catch {
      // Non-blocking telemetry
    }
  },

  async getAdminAnalytics(): Promise<AdminAnalyticsData> {
    const response = await apiClient.get<AdminAnalyticsData>('/analytics/admin/');
    return response.data;
  },
};
