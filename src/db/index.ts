import { drizzle } from 'drizzle-orm/d1';
import type { Env } from '../types/env';
import * as schema from './schema';

// Initialize database connection with schema
export function initializeDb(env: Env) {
  return drizzle(env.DB, { schema });
}

export type Database = ReturnType<typeof initializeDb>;

// Re-export schema for convenience
export * from './schema';