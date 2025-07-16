import { describe, it, expect } from '@jest/globals';
import { validateRequest } from '../src/schemas/users';
import { UserCreateSchema, UserUpdateSchema, PasswordChangeSchema } from '../src/schemas/users';
import { hasPermission, hasAnyPermission, SYSTEM_PERMISSIONS } from '../src/schemas/roles';

describe('User Validation Schemas', () => {
  describe('UserCreateSchema', () => {
    it('should validate valid user creation data', () => {
      const validData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123',
        first_name: 'Test',
        last_name: 'User'
      };

      expect(() => validateRequest(UserCreateSchema, validData)).not.toThrow();
    });

    it('should reject invalid username', () => {
      const invalidData = {
        username: 'a', // too short
        email: 'test@example.com',
        password: 'Password123',
        first_name: 'Test',
        last_name: 'User'
      };

      expect(() => validateRequest(UserCreateSchema, invalidData)).toThrow();
    });

    it('should reject invalid email', () => {
      const invalidData = {
        username: 'testuser',
        email: 'invalid-email',
        password: 'Password123',
        first_name: 'Test',
        last_name: 'User'
      };

      expect(() => validateRequest(UserCreateSchema, invalidData)).toThrow();
    });

    it('should reject weak password', () => {
      const invalidData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'weak', // too short and no uppercase/number
        first_name: 'Test',
        last_name: 'User'
      };

      expect(() => validateRequest(UserCreateSchema, invalidData)).toThrow();
    });

    it('should accept optional fields with defaults', () => {
      const validData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123',
        first_name: 'Test',
        last_name: 'User',
        role: 'admin',
        root_admin: true
      };

      const result = validateRequest(UserCreateSchema, validData);
      expect(result.role).toBe('admin');
      expect(result.root_admin).toBe(true);
    });
  });

  describe('UserUpdateSchema', () => {
    it('should validate partial user update data', () => {
      const validData = {
        first_name: 'Updated',
        email: 'updated@example.com'
      };

      expect(() => validateRequest(UserUpdateSchema, validData)).not.toThrow();
    });

    it('should allow empty updates', () => {
      const emptyData = {};

      expect(() => validateRequest(UserUpdateSchema, emptyData)).not.toThrow();
    });
  });

  describe('PasswordChangeSchema', () => {
    it('should validate password change with matching confirmation', () => {
      const validData = {
        current_password: 'OldPassword123',
        new_password: 'NewPassword123',
        new_password_confirmation: 'NewPassword123'
      };

      expect(() => validateRequest(PasswordChangeSchema, validData)).not.toThrow();
    });

    it('should reject mismatched password confirmation', () => {
      const invalidData = {
        current_password: 'OldPassword123',
        new_password: 'NewPassword123',
        new_password_confirmation: 'DifferentPassword123'
      };

      expect(() => validateRequest(PasswordChangeSchema, invalidData)).toThrow();
    });

    it('should reject weak new password', () => {
      const invalidData = {
        current_password: 'OldPassword123',
        new_password: 'weak',
        new_password_confirmation: 'weak'
      };

      expect(() => validateRequest(PasswordChangeSchema, invalidData)).toThrow();
    });
  });
});

describe('Permission System', () => {
  describe('hasPermission', () => {
    it('should return true for exact permission match', () => {
      const userPermissions = ['users.view', 'users.create'];
      expect(hasPermission(userPermissions, 'users.view')).toBe(true);
      expect(hasPermission(userPermissions, 'users.create')).toBe(true);
    });

    it('should return false for missing permission', () => {
      const userPermissions = ['users.view'];
      expect(hasPermission(userPermissions, 'users.delete')).toBe(false);
    });

    it('should return true for admin wildcard permission', () => {
      const userPermissions = ['admin.*'];
      expect(hasPermission(userPermissions, 'users.delete')).toBe(true);
      expect(hasPermission(userPermissions, 'servers.create')).toBe(true);
    });
  });

  describe('hasAnyPermission', () => {
    it('should return true if user has any of the required permissions', () => {
      const userPermissions = ['users.view', 'profile.edit'];
      const requiredPermissions = ['users.create', 'users.view'];
      
      expect(hasAnyPermission(userPermissions, requiredPermissions)).toBe(true);
    });

    it('should return false if user has none of the required permissions', () => {
      const userPermissions = ['profile.edit'];
      const requiredPermissions = ['users.create', 'users.delete'];
      
      expect(hasAnyPermission(userPermissions, requiredPermissions)).toBe(false);
    });
  });

  describe('SYSTEM_PERMISSIONS', () => {
    it('should contain all required permissions', () => {
      const requiredPermissions = [
        'users.view',
        'users.create',
        'users.edit',
        'users.delete',
        'profile.edit',
        'admin.view'
      ];

      for (const permission of requiredPermissions) {
        expect(SYSTEM_PERMISSIONS).toHaveProperty(permission);
      }
    });

    it('should have descriptions for all permissions', () => {
      for (const [permission, description] of Object.entries(SYSTEM_PERMISSIONS)) {
        expect(typeof permission).toBe('string');
        expect(typeof description).toBe('string');
        expect(permission.length).toBeGreaterThan(0);
        expect(description.length).toBeGreaterThan(0);
      }
    });
  });
});

describe('Utility Functions', () => {
  describe('validateRequest', () => {
    it('should return validated data for valid input', () => {
      const schema = UserCreateSchema;
      const validData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123',
        first_name: 'Test',
        last_name: 'User'
      };

      const result = validateRequest(schema, validData);
      expect(result.username).toBe('testuser');
      expect(result.email).toBe('test@example.com');
    });

    it('should throw error for invalid input', () => {
      const schema = UserCreateSchema;
      const invalidData = {
        username: '', // invalid
        email: 'test@example.com',
        password: 'Password123',
        first_name: 'Test',
        last_name: 'User'
      };

      expect(() => validateRequest(schema, invalidData)).toThrow();
    });
  });
});