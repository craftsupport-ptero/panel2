// Core types for Pterodactyl Panel Serverless API

export interface User {
  id: number;
  username: string;
  email: string;
  email_verified_at: string | null;
  first_name: string;
  last_name: string;
  language: string;
  root_admin: boolean;
  use_totp: boolean;
  gravatar: boolean;
  avatar_url: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface UserCreateRequest {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  language?: string;
  role?: string;
  root_admin?: boolean;
}

export interface UserUpdateRequest {
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  language?: string;
  role?: string;
  root_admin?: boolean;
}

export interface ProfileUpdateRequest {
  email?: string;
  first_name?: string;
  last_name?: string;
  language?: string;
  preferences?: UserPreferences;
}

export interface PasswordChangeRequest {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  notifications: boolean;
  language: string;
  timezone: string;
}

export interface Role {
  id: number;
  name: string;
  description: string;
  permissions: string[];
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: number;
  name: string;
  description: string;
  resource: string;
  action: string;
}

export interface UserActivity {
  id: number;
  user_id: number;
  action: string;
  details: string | null;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
}

export interface JwtPayload {
  user_id: number;
  username: string;
  email: string;
  role: string;
  permissions: string[];
  iat: number;
  exp: number;
}

export interface CloudflareEnv {
  DB: D1Database;
  AVATARS: R2Bucket;
  JWT_SECRET: string;
  BCRYPT_ROUNDS: string;
  ENVIRONMENT: string;
}

export interface RequestContext {
  user?: User;
  permissions?: string[];
  env: CloudflareEnv;
}