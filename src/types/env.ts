/// <reference types="@cloudflare/workers-types" />

export interface Env {
  // D1 Database binding
  DB: D1Database;
  
  // KV Cache binding
  CACHE: KVNamespace;
  
  // R2 Storage binding  
  STORAGE: R2Bucket;
  
  // Environment variables
  ENVIRONMENT: 'development' | 'staging' | 'production';
  JWT_SECRET?: string;
  BCRYPT_ROUNDS?: string;
  APP_URL?: string;
  
  // Rate limiting
  RATE_LIMIT_WINDOW?: string;
  RATE_LIMIT_MAX_REQUESTS?: string;
}