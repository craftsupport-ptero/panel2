import { JWTService } from '../auth/jwt';
import { PasswordService } from '../auth/password';
import type { Env, User } from '../types';

// Mock environment
const mockEnv: Env = {
  SESSIONS: {} as KVNamespace,
  RATE_LIMITS: {} as KVNamespace,
  DB: {} as D1Database,
  JWT_SECRET: 'test-secret-key-at-least-32-characters-long-for-security',
  JWT_EXPIRES_IN: '15m',
  JWT_REFRESH_EXPIRES_IN: '7d',
  BCRYPT_ROUNDS: '12',
  RATE_LIMIT_REQUESTS: '100',
  RATE_LIMIT_WINDOW: '900',
  ENVIRONMENT: 'development'
};

// Mock user
const mockUser: User = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  root_admin: false,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
};

describe('Authentication Services', () => {
  describe('JWTService', () => {
    let jwtService: JWTService;

    beforeEach(() => {
      jwtService = new JWTService(mockEnv);
    });

    test('should generate access token', async () => {
      const token = await jwtService.generateAccessToken(mockUser);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    test('should generate refresh token', async () => {
      const token = await jwtService.generateRefreshToken(mockUser);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    test('should generate token pair', async () => {
      const tokenPair = await jwtService.generateTokenPair(mockUser);
      
      expect(tokenPair).toBeDefined();
      expect(tokenPair.accessToken).toBeDefined();
      expect(tokenPair.refreshToken).toBeDefined();
      expect(tokenPair.expiresIn).toBe(900); // 15 minutes
    });

    test('should verify valid token', async () => {
      const token = await jwtService.generateAccessToken(mockUser);
      const payload = await jwtService.verifyToken(token);
      
      expect(payload).toBeDefined();
      expect(payload.sub).toBe(mockUser.id);
      expect(payload.username).toBe(mockUser.username);
      expect(payload.email).toBe(mockUser.email);
      expect(payload.type).toBe('access');
    });

    test('should reject invalid token', async () => {
      await expect(jwtService.verifyToken('invalid-token')).rejects.toThrow();
    });
  });

  describe('PasswordService', () => {
    let passwordService: PasswordService;

    beforeEach(() => {
      passwordService = new PasswordService(mockEnv);
    });

    test('should hash password', async () => {
      const password = 'TestPassword123!';
      const hash = await passwordService.hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });

    test('should verify correct password', async () => {
      const password = 'TestPassword123!';
      const hash = await passwordService.hashPassword(password);
      const isValid = await passwordService.verifyPassword(password, hash);
      
      expect(isValid).toBe(true);
    });

    test('should reject incorrect password', async () => {
      const password = 'TestPassword123!';
      const wrongPassword = 'WrongPassword123!';
      const hash = await passwordService.hashPassword(password);
      const isValid = await passwordService.verifyPassword(wrongPassword, hash);
      
      expect(isValid).toBe(false);
    });

    test('should validate strong password', () => {
      const strongPassword = 'StrongPassword123!';
      const validation = passwordService.validatePasswordStrength(strongPassword);
      
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test('should reject weak password', () => {
      const weakPassword = 'weak';
      const validation = passwordService.validatePasswordStrength(weakPassword);
      
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    test('should generate secure password', () => {
      const password = passwordService.generateSecurePassword(16);
      
      expect(password).toBeDefined();
      expect(password.length).toBe(16);
      
      const validation = passwordService.validatePasswordStrength(password);
      expect(validation.valid).toBe(true);
    });

    test('should generate reset token', () => {
      const token = passwordService.generateResetToken();
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBe(64); // 32 bytes * 2 (hex)
    });
  });
});

describe('Authentication Schemas', () => {
  test('should validate login request', async () => {
    const { loginSchema } = await import('../schemas/auth');
    
    const validLogin = {
      username: 'testuser',
      password: 'TestPassword123!',
      remember: false
    };
    
    const result = loginSchema.safeParse(validLogin);
    expect(result.success).toBe(true);
  });

  test('should reject invalid login request', async () => {
    const { loginSchema } = await import('../schemas/auth');
    
    const invalidLogin = {
      username: '', // Empty username
      password: 'TestPassword123!'
    };
    
    const result = loginSchema.safeParse(invalidLogin);
    expect(result.success).toBe(false);
  });
});

describe('Error Classes', () => {
  test('should create authentication error', async () => {
    const { AuthenticationError } = await import('../utils/errors');
    
    const error = new AuthenticationError('Test auth error');
    
    expect(error.message).toBe('Test auth error');
    expect(error.statusCode).toBe(401);
    expect(error.code).toBe('AUTHENTICATION_ERROR');
    expect(error.isOperational).toBe(true);
  });

  test('should create validation error', async () => {
    const { ValidationError } = await import('../utils/errors');
    
    const error = new ValidationError('Test validation error', [
      { field: 'username', reason: 'required' }
    ]);
    
    expect(error.message).toBe('Test validation error');
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.details.errors).toHaveLength(1);
  });
});

describe('Response Utilities', () => {
  test('should create success response', async () => {
    const { createSuccessResponse } = await import('../utils/responses');
    
    const data = { id: 1, name: 'Test' };
    const response = createSuccessResponse(data, 'Success message');
    
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/json');
    
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data).toEqual(data);
    expect(body.message).toBe('Success message');
  });

  test('should create error response', async () => {
    const { createErrorResponse } = await import('../utils/responses');
    
    const response = createErrorResponse('Test error', 400, 'TEST_ERROR');
    
    expect(response.status).toBe(400);
    expect(response.headers.get('Content-Type')).toBe('application/json');
    
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe('TEST_ERROR');
    expect(body.message).toBe('Test error');
  });
});