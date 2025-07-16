import { describe, it, expect, beforeEach } from '@jest/globals';
import { AuthService } from '../services/auth';
import { createDb } from '../db';
import bcrypt from 'bcryptjs';

// Mock database
const mockDb = {
  select: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
} as any;

// Mock bcrypt
jest.mock('bcryptjs');
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

// Mock JWT
jest.mock('hono/jwt', () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;
  const jwtSecret = 'test-secret';
  const bcryptRounds = 10;

  beforeEach(() => {
    jest.clearAllMocks();
    authService = new AuthService(mockDb, jwtSecret, bcryptRounds);
  });

  describe('login', () => {
    it('should successfully authenticate valid credentials', async () => {
      const mockUser = {
        id: 1,
        uuid: 'test-uuid',
        email: 'test@example.com',
        password: 'hashed-password',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        rootAdmin: false,
        language: 'en',
        useTotp: false,
      };

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            get: jest.fn().mockResolvedValue(mockUser),
          }),
        }),
      });

      mockBcrypt.compare.mockResolvedValue(true);

      const { sign } = await import('hono/jwt');
      (sign as jest.Mock).mockResolvedValue('mock-jwt-token');

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.user.email).toBe('test@example.com');
      expect(result.token).toBe('mock-jwt-token');
    });

    it('should reject invalid credentials', async () => {
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            get: jest.fn().mockResolvedValue(null),
          }),
        }),
      });

      await expect(
        authService.login({
          email: 'invalid@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('Invalid credentials');
    });

    it('should reject incorrect password', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashed-password',
      };

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            get: jest.fn().mockResolvedValue(mockUser),
          }),
        }),
      });

      mockBcrypt.compare.mockResolvedValue(false);

      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('register', () => {
    it('should successfully register new user', async () => {
      // Mock no existing user
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            get: jest.fn().mockResolvedValue(null),
          }),
        }),
      });

      // Mock successful insert
      const mockNewUser = {
        id: 2,
        uuid: 'new-uuid',
        email: 'new@example.com',
        username: 'newuser',
        firstName: 'New',
        lastName: 'User',
        rootAdmin: false,
        language: 'en',
        useTotp: false,
      };

      mockDb.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockReturnValue({
            get: jest.fn().mockResolvedValue(mockNewUser),
          }),
        }),
      });

      mockBcrypt.hash.mockResolvedValue('hashed-password');

      const { sign } = await import('hono/jwt');
      (sign as jest.Mock).mockResolvedValue('mock-jwt-token');

      const result = await authService.register({
        email: 'new@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
        username: 'newuser',
      });

      expect(result.user.email).toBe('new@example.com');
      expect(result.token).toBe('mock-jwt-token');
    });

    it('should reject duplicate email', async () => {
      // Mock existing user
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            get: jest.fn().mockResolvedValue({ id: 1 }),
          }),
        }),
      });

      await expect(
        authService.register({
          email: 'existing@example.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
          username: 'testuser',
        })
      ).rejects.toThrow('User already exists');
    });
  });

  describe('updatePassword', () => {
    it('should successfully update password', async () => {
      const mockUser = {
        password: 'old-hashed-password',
      };

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            get: jest.fn().mockResolvedValue(mockUser),
          }),
        }),
      });

      mockBcrypt.compare.mockResolvedValue(true);
      mockBcrypt.hash.mockResolvedValue('new-hashed-password');

      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(undefined),
        }),
      });

      await authService.updatePassword(1, 'oldpassword', 'newpassword');

      expect(mockBcrypt.hash).toHaveBeenCalledWith('newpassword', bcryptRounds);
    });

    it('should reject incorrect current password', async () => {
      const mockUser = {
        password: 'hashed-password',
      };

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            get: jest.fn().mockResolvedValue(mockUser),
          }),
        }),
      });

      mockBcrypt.compare.mockResolvedValue(false);

      await expect(
        authService.updatePassword(1, 'wrongpassword', 'newpassword')
      ).rejects.toThrow('Current password is incorrect');
    });
  });
});