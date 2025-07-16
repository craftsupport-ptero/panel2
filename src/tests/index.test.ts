import { describe, it, expect } from '@jest/globals';
import app from '../index';

describe('Pterodactyl Serverless API', () => {
  it('should respond to health check', async () => {
    const req = new Request('http://localhost/health', {
      method: 'GET',
    });

    const env = {
      ENVIRONMENT: 'test',
      JWT_SECRET: 'test-secret-key',
      BCRYPT_ROUNDS: '10',
      API_RATE_LIMIT: '100',
      SESSION_TIMEOUT: '3600',
    };

    const res = await app.request(req, env);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.status).toBe('ok');
    expect(data.environment).toBe('test');
  });

  it('should respond to root endpoint', async () => {
    const req = new Request('http://localhost/', {
      method: 'GET',
    });

    const env = {
      ENVIRONMENT: 'test',
      JWT_SECRET: 'test-secret-key',
      BCRYPT_ROUNDS: '10',
      API_RATE_LIMIT: '100',
      SESSION_TIMEOUT: '3600',
    };

    const res = await app.request(req, env);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.name).toBe('Pterodactyl Panel API');
    expect(data.version).toBe('2.0.0');
    expect(data.endpoints).toBeDefined();
  });

  it('should return 404 for unknown routes', async () => {
    const req = new Request('http://localhost/unknown-route', {
      method: 'GET',
    });

    const env = {
      ENVIRONMENT: 'test',
      JWT_SECRET: 'test-secret-key',
      BCRYPT_ROUNDS: '10',
      API_RATE_LIMIT: '100',
      SESSION_TIMEOUT: '3600',
    };

    const res = await app.request(req, env);
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.errors).toBeDefined();
    expect(data.errors[0].code).toBe('404');
  });
});