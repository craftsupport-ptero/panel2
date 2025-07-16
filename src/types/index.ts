// Environment bindings for Cloudflare Worker
export interface Env {
  // KV Namespaces
  SESSIONS: KVNamespace;
  RATE_LIMITS: KVNamespace;
  
  // D1 Database
  DB: D1Database;
  
  // Environment Variables
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH_EXPIRES_IN: string;
  BCRYPT_ROUNDS: string;
  RATE_LIMIT_REQUESTS: string;
  RATE_LIMIT_WINDOW: string;
  ENVIRONMENT: string;
}

// User interface
export interface User {
  id: number;
  username: string;
  email: string;
  password?: string;
  root_admin: boolean;
  created_at: string;
  updated_at: string;
}

// JWT payload interface
export interface JWTPayload {
  sub: number; // user id
  username: string;
  email: string;
  admin: boolean;
  iat: number;
  exp: number;
  type: 'access' | 'refresh';
}

// Session interface
export interface Session {
  id: string;
  user_id: number;
  user_agent?: string;
  ip_address?: string;
  last_activity: string;
  expires_at: string;
}

// API Key interface
export interface ApiKey {
  id: string;
  user_id: number;
  name: string;
  token: string;
  allowed_ips?: string[];
  permissions: string[];
  last_used_at?: string;
  expires_at?: string;
  created_at: string;
}

// Request context
export interface RequestContext {
  user?: User;
  session?: Session;
  apiKey?: ApiKey;
  ip: string;
  userAgent?: string;
}

// Rate limit info
export interface RateLimit {
  count: number;
  resetTime: number;
  limit: number;
  remaining: number;
}

// API Response interfaces
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    pagination?: {
      page: number;
      perPage: number;
      total: number;
      totalPages: number;
    };
    rateLimit?: RateLimit;
  };
}

// Error response
export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  code?: string;
  details?: any;
}