import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { UserService } from '../src/services/userService';
import { ActivityService } from '../src/services/activityService';
import { RoleService } from '../src/services/roleService';

// Mock CloudflareEnv for testing
const mockEnv = {
  DB: {
    prepare: jest.fn(),
    exec: jest.fn(),
  },
  AVATARS: {},
  JWT_SECRET: 'test-secret',
  BCRYPT_ROUNDS: '10',
  ENVIRONMENT: 'test',
} as any;

describe('UserService', () => {
  let userService: UserService;
  let mockPrepare: jest.Mock;
  let mockBind: jest.Mock;
  let mockFirst: jest.Mock;
  let mockAll: jest.Mock;
  let mockRun: jest.Mock;

  beforeAll(() => {
    mockPrepare = jest.fn();
    mockBind = jest.fn();
    mockFirst = jest.fn();
    mockAll = jest.fn();
    mockRun = jest.fn();

    // Chain the mock methods
    mockPrepare.mockReturnValue({
      bind: mockBind
    });
    mockBind.mockReturnValue({
      first: mockFirst,
      all: mockAll,
      run: mockRun
    });

    mockEnv.DB.prepare = mockPrepare;
    userService = new UserService(mockEnv);
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        role: 'user',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      mockFirst.mockResolvedValue(mockUser);

      const result = await userService.getUserById(1);

      expect(result).toEqual(mockUser);
      expect(mockPrepare).toHaveBeenCalledWith(expect.stringContaining('SELECT'));
      expect(mockBind).toHaveBeenCalledWith(1);
    });

    it('should return null when user not found', async () => {
      mockFirst.mockResolvedValue(null);

      const result = await userService.getUserById(999);

      expect(result).toBeNull();
    });
  });

  describe('createUser', () => {
    it('should create user successfully', async () => {
      const userData = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
        first_name: 'New',
        last_name: 'User',
        role: 'user'
      };

      // Mock checks for existing user (should return null)
      mockFirst
        .mockResolvedValueOnce(null) // username check
        .mockResolvedValueOnce(null) // email check
        .mockResolvedValueOnce({ id: 1 }) // insert result
        .mockResolvedValueOnce({ // created user
          id: 1,
          ...userData,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        });

      mockRun.mockResolvedValue({}); // preferences insert

      const result = await userService.createUser(userData);

      expect(result).toBeDefined();
      expect(result.username).toBe(userData.username);
      expect(result.email).toBe(userData.email);
    });

    it('should throw error when username already exists', async () => {
      const userData = {
        username: 'existinguser',
        email: 'new@example.com',
        password: 'password123',
        first_name: 'New',
        last_name: 'User',
        role: 'user'
      };

      // Mock existing user found
      mockFirst.mockResolvedValue({ id: 1, username: 'existinguser' });

      await expect(userService.createUser(userData)).rejects.toThrow('Username already exists');
    });

    it('should throw error when email already exists', async () => {
      const userData = {
        username: 'newuser',
        email: 'existing@example.com',
        password: 'password123',
        first_name: 'New',
        last_name: 'User',
        role: 'user'
      };

      // Mock username check passes, email check fails
      mockFirst
        .mockResolvedValueOnce(null) // username check
        .mockResolvedValueOnce({ id: 1, email: 'existing@example.com' }); // email check

      await expect(userService.createUser(userData)).rejects.toThrow('Email already exists');
    });
  });

  describe('getUsers', () => {
    it('should return paginated users', async () => {
      const mockUsers = [
        { id: 1, username: 'user1', email: 'user1@example.com' },
        { id: 2, username: 'user2', email: 'user2@example.com' }
      ];

      mockFirst.mockResolvedValue({ total: 2 }); // count query
      mockAll.mockResolvedValue({ results: mockUsers }); // main query

      const result = await userService.getUsers({ page: 1, limit: 10 });

      expect(result.data).toEqual(mockUsers);
      expect(result.pagination.total).toBe(2);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.pages).toBe(1);
    });

    it('should handle search filter', async () => {
      mockFirst.mockResolvedValue({ total: 1 });
      mockAll.mockResolvedValue({ results: [{ id: 1, username: 'searchuser' }] });

      await userService.getUsers({ page: 1, limit: 10, search: 'search' });

      expect(mockPrepare).toHaveBeenCalledWith(expect.stringContaining('LIKE'));
    });
  });
});

describe('ActivityService', () => {
  let activityService: ActivityService;

  beforeAll(() => {
    activityService = new ActivityService(mockEnv);
  });

  describe('logActivity', () => {
    it('should log activity successfully', async () => {
      mockRun.mockResolvedValue({});

      await activityService.logActivity(1, 'test.action', 'Test details', '127.0.0.1', 'Test Agent');

      expect(mockPrepare).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO user_activities'));
      expect(mockBind).toHaveBeenCalledWith(1, 'test.action', 'Test details', '127.0.0.1', 'Test Agent', expect.any(String));
    });
  });

  describe('getUserActivities', () => {
    it('should return user activities with pagination', async () => {
      const mockActivities = [
        { id: 1, user_id: 1, action: 'login', created_at: '2024-01-01T00:00:00Z' }
      ];

      mockFirst.mockResolvedValue({ total: 1 });
      mockAll.mockResolvedValue({ results: mockActivities });

      const result = await activityService.getUserActivities(1, { page: 1, limit: 10 });

      expect(result.data).toEqual(mockActivities);
      expect(result.pagination.total).toBe(1);
    });
  });
});

describe('RoleService', () => {
  let roleService: RoleService;

  beforeAll(() => {
    roleService = new RoleService(mockEnv);
  });

  describe('getRoles', () => {
    it('should return all roles', async () => {
      const mockRoles = [
        { id: 1, name: 'admin', description: 'Administrator', permissions: '["users.view"]' },
        { id: 2, name: 'user', description: 'User', permissions: '["profile.edit"]' }
      ];

      mockAll.mockResolvedValue({ results: mockRoles });

      const result = await roleService.getRoles();

      expect(result).toHaveLength(2);
      expect(result[0].permissions).toEqual(['users.view']);
      expect(result[1].permissions).toEqual(['profile.edit']);
    });
  });

  describe('getUserEffectivePermissions', () => {
    it('should return permissions for admin user', async () => {
      mockFirst.mockResolvedValue({ role: 'admin', root_admin: true });

      const result = await roleService.getUserEffectivePermissions(1);

      expect(result).toContain('users.view');
      expect(result).toContain('admin.view');
    });

    it('should return permissions for regular user', async () => {
      mockFirst.mockResolvedValue({ role: 'user', root_admin: false });

      const result = await roleService.getUserEffectivePermissions(1);

      expect(result).toContain('profile.edit');
      expect(result).not.toContain('users.create');
    });
  });
});