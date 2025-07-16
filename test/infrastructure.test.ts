/**
 * Infrastructure test for Pterodactyl Panel serverless setup
 * Tests basic Worker functionality and health endpoint
 */

import app from '../src/index';
import type { Env } from '../src/types/env';

// Mock environment for testing
const mockEnv: Env = {
  DB: {} as D1Database, // Mock D1 database - will fail connection test
  CACHE: {} as KVNamespace,
  STORAGE: {} as R2Bucket,
  ENVIRONMENT: 'development',
  JWT_SECRET: 'test-secret',
  BCRYPT_ROUNDS: '10',
  APP_URL: 'http://localhost:8787',
};

describe('Infrastructure Tests', () => {
  test('Health endpoint returns unhealthy when database fails', async () => {
    const req = new Request('http://localhost:8787/health');
    const res = await app.fetch(req, mockEnv);
    
    expect(res.status).toBe(500);
    
    const data = await res.json();
    expect(data).toHaveProperty('status', 'unhealthy');
    expect(data).toHaveProperty('version', '2.0.0-serverless');
    expect(data).toHaveProperty('environment', 'development');
    expect(data).toHaveProperty('database', 'disconnected');
  });

  test('API version endpoint works', async () => {
    const req = new Request('http://localhost:8787/api/version');
    const res = await app.fetch(req, mockEnv);
    
    expect(res.status).toBe(200);
    
    const data = await res.json();
    expect(data).toHaveProperty('name', 'Pterodactyl Panel');
    expect(data).toHaveProperty('version', '2.0.0-serverless');
    expect(data).toHaveProperty('environment', 'development');
  });

  test('404 handler works', async () => {
    const req = new Request('http://localhost:8787/nonexistent');
    const res = await app.fetch(req, mockEnv);
    
    expect(res.status).toBe(404);
    
    const data = await res.json();
    expect(data).toHaveProperty('error', 'Not Found');
  });

  test('CORS headers are present', async () => {
    const req = new Request('http://localhost:8787/api/version');
    const res = await app.fetch(req, mockEnv);
    
    expect(res.headers.get('access-control-allow-origin')).toBe('*');
    expect(res.headers.get('access-control-allow-methods')).toContain('GET');
  });
});

console.log('✅ Infrastructure tests completed. Worker build and basic functionality verified.');