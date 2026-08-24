export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  role: Role;
  created_at: string;
  updated_at: string;
}

export type Role = 'ADMIN' | 'MENTOR';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  username: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface RefreshTokenRequest {
  refresh: string;
}

export interface RefreshTokenResponse {
  access: string;
}

// Category Types
export interface Category {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface CategoryFormData {
  name: string;
  description: string;
}

// Template Types
export interface Template {
  id: number;
  name: string;
  description: string;
  category: number;
  image: string;
  created_at: string;
  updated_at: string;
}

export interface TemplateFormData {
  name: string;
  description: string;
  category: number;
  image?: File;
}

// Certificate Types
export interface Certificate {
  id: number;
  certificate_number: string;
  title: string;
  description: string;
  template: number;
  recipient_name: string;
  recipient_email: string;
  issued_by: number;
  issued_at: string;
  verified: boolean;
  verification_id: string;
  created_at: string;
  updated_at: string;
}

export interface CertificateFormData {
  certificate_number: string;
  title: string;
  description: string;
  template: number;
  recipient_name: string;
  recipient_email: string;
}

// Verification Types
export interface VerificationResponse {
  certificate: Certificate;
  valid: boolean;
  verified_at: string;
}

export interface VerificationRequest {
  certificate_id: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
