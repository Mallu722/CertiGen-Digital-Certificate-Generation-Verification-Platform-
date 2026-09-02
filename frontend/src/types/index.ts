export interface User {
  id: string;
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
  role?: Role;
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
  id: string;
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
  id: string;
  name: string;
  description: string;
  purpose?: string;
  title_prefix?: string;
  subtitle?: string;
  presentation_line?: string;
  wording_pattern?: string;
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  badge_text?: string;
  category: string;
  category_name?: string;
  image?: string;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TemplateFormData {
  name: string;
  description: string;
  purpose?: string;
  title_prefix?: string;
  subtitle?: string;
  presentation_line?: string;
  wording_pattern?: string;
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  badge_text?: string;
  category: string;
  image?: File;
  is_active?: boolean;
}

// Certificate Types
export type CertificateStatus = 'VALID' | 'REVOKED';

export interface Certificate {
  id: string;
  certificate_number: string;
  title: string;
  description: string;
  template: string;
  recipient_name: string;
  recipient_email: string;
  achievement?: string;
  organization_name?: string;
  signatory_name?: string;
  signatory_title?: string;
  metadata?: Record<string, any>;
  issued_by: string;
  issued_at: string;
  status: CertificateStatus;
  revoked_at?: string | null;
  revocation_reason?: string;
  verified: boolean;
  verification_id: string;
  pdf_url?: string;
  qr_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CertificateFormData {
  title: string;
  description?: string;
  template: string;
  recipient_name: string;
  recipient_email: string;
  achievement?: string;
  organization_name?: string;
  signatory_name?: string;
  signatory_title?: string;
  metadata?: Record<string, any>;
  certificate_number?: string;
}

// Verification Types
export interface VerificationResponse {
  certificate?: Certificate;
  valid: boolean;
  status?: CertificateStatus | 'NOT_FOUND';
  verified_at: string;
  revoked_at?: string | null;
  revocation_reason?: string;
  message?: string;
  error?: string;
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
