import bcrypt from 'bcryptjs';
import {
  User,
  UserCreateRequest,
  UserUpdateRequest,
  ProfileUpdateRequest,
  UserPreferences,
  PaginationParams,
  PaginatedResponse,
  CloudflareEnv
} from '@/types';
import { getRolePermissions } from '@/schemas/roles';
import { getCurrentTimestamp } from '@/utils';

export class UserService {
  private db: D1Database;
  private bcryptRounds: number;

  constructor(env: CloudflareEnv) {
    this.db = env.DB;
    this.bcryptRounds = parseInt(env.BCRYPT_ROUNDS, 10) || 12;
  }

  /**
   * Get paginated list of users
   */
  async getUsers(params: PaginationParams): Promise<PaginatedResponse<User>> {
    let query = `
      SELECT 
        u.id, u.username, u.email, u.email_verified_at,
        u.first_name, u.last_name, u.language, u.root_admin,
        u.use_totp, u.gravatar, u.avatar_url, u.role,
        u.created_at, u.updated_at
      FROM users u
      WHERE 1=1
    `;
    
    const queryParams: any[] = [];
    let paramIndex = 1;

    // Add search filter
    if (params.search) {
      query += ` AND (u.username LIKE ?${paramIndex} OR u.email LIKE ?${paramIndex} OR u.first_name LIKE ?${paramIndex} OR u.last_name LIKE ?${paramIndex})`;
      queryParams.push(`%${params.search}%`);
      paramIndex++;
    }

    // Add role filter
    if (params.role) {
      query += ` AND u.role = ?${paramIndex}`;
      queryParams.push(params.role);
      paramIndex++;
    }

    // Count total records
    const countQuery = query.replace(/SELECT.*FROM/, 'SELECT COUNT(*) as total FROM');
    const countResult = await this.db.prepare(countQuery).bind(...queryParams).first<{ total: number }>();
    const total = countResult?.total || 0;

    // Add sorting and pagination
    const sortField = params.sort || 'id';
    const sortOrder = params.order || 'asc';
    query += ` ORDER BY u.${sortField} ${sortOrder.toUpperCase()}`;

    const page = params.page || 1;
    const limit = params.limit || 10;
    const offset = (page - 1) * limit;
    
    query += ` LIMIT ?${paramIndex} OFFSET ?${paramIndex + 1}`;
    queryParams.push(limit, offset);

    // Execute query
    const result = await this.db.prepare(query).bind(...queryParams).all<User>();
    const users = result.results || [];

    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get user by ID
   */
  async getUserById(id: number): Promise<User | null> {
    const result = await this.db
      .prepare(`
        SELECT 
          u.id, u.username, u.email, u.email_verified_at,
          u.first_name, u.last_name, u.language, u.root_admin,
          u.use_totp, u.gravatar, u.avatar_url, u.role,
          u.created_at, u.updated_at
        FROM users u 
        WHERE u.id = ?
      `)
      .bind(id)
      .first<User>();

    return result || null;
  }

  /**
   * Get user by username
   */
  async getUserByUsername(username: string): Promise<User | null> {
    const result = await this.db
      .prepare(`
        SELECT 
          u.id, u.username, u.email, u.email_verified_at,
          u.first_name, u.last_name, u.language, u.root_admin,
          u.use_totp, u.gravatar, u.avatar_url, u.role,
          u.created_at, u.updated_at
        FROM users u 
        WHERE u.username = ?
      `)
      .bind(username)
      .first<User>();

    return result || null;
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<User | null> {
    const result = await this.db
      .prepare(`
        SELECT 
          u.id, u.username, u.email, u.email_verified_at,
          u.first_name, u.last_name, u.language, u.root_admin,
          u.use_totp, u.gravatar, u.avatar_url, u.role,
          u.created_at, u.updated_at
        FROM users u 
        WHERE u.email = ?
      `)
      .bind(email)
      .first<User>();

    return result || null;
  }

  /**
   * Create a new user
   */
  async createUser(userData: UserCreateRequest): Promise<User> {
    // Check if username already exists
    const existingUsername = await this.getUserByUsername(userData.username);
    if (existingUsername) {
      throw new Error('Username already exists');
    }

    // Check if email already exists
    const existingEmail = await this.getUserByEmail(userData.email);
    if (existingEmail) {
      throw new Error('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, this.bcryptRounds);
    const now = getCurrentTimestamp();

    // Insert user
    const result = await this.db
      .prepare(`
        INSERT INTO users (
          username, email, password, first_name, last_name,
          language, root_admin, role, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        RETURNING id
      `)
      .bind(
        userData.username,
        userData.email,
        hashedPassword,
        userData.first_name,
        userData.last_name,
        userData.language || 'en',
        userData.root_admin || false,
        userData.role || 'user',
        now,
        now
      )
      .first<{ id: number }>();

    if (!result?.id) {
      throw new Error('Failed to create user');
    }

    // Create default preferences
    await this.createDefaultPreferences(result.id);

    // Return the created user
    const user = await this.getUserById(result.id);
    if (!user) {
      throw new Error('Failed to retrieve created user');
    }

    return user;
  }

  /**
   * Update user
   */
  async updateUser(id: number, updates: UserUpdateRequest): Promise<User> {
    const user = await this.getUserById(id);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if username is being changed and already exists
    if (updates.username && updates.username !== user.username) {
      const existingUsername = await this.getUserByUsername(updates.username);
      if (existingUsername) {
        throw new Error('Username already exists');
      }
    }

    // Check if email is being changed and already exists
    if (updates.email && updates.email !== user.email) {
      const existingEmail = await this.getUserByEmail(updates.email);
      if (existingEmail) {
        throw new Error('Email already exists');
      }
    }

    // Build update query
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    
    if (updates.username !== undefined) {
      updateFields.push('username = ?');
      updateValues.push(updates.username);
    }
    if (updates.email !== undefined) {
      updateFields.push('email = ?');
      updateValues.push(updates.email);
    }
    if (updates.first_name !== undefined) {
      updateFields.push('first_name = ?');
      updateValues.push(updates.first_name);
    }
    if (updates.last_name !== undefined) {
      updateFields.push('last_name = ?');
      updateValues.push(updates.last_name);
    }
    if (updates.language !== undefined) {
      updateFields.push('language = ?');
      updateValues.push(updates.language);
    }
    if (updates.role !== undefined) {
      updateFields.push('role = ?');
      updateValues.push(updates.role);
    }
    if (updates.root_admin !== undefined) {
      updateFields.push('root_admin = ?');
      updateValues.push(updates.root_admin);
    }

    if (updateFields.length === 0) {
      return user; // No updates needed
    }

    updateFields.push('updated_at = ?');
    updateValues.push(getCurrentTimestamp());
    updateValues.push(id); // For WHERE clause

    const query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
    await this.db.prepare(query).bind(...updateValues).run();

    // Return updated user
    const updatedUser = await this.getUserById(id);
    if (!updatedUser) {
      throw new Error('Failed to retrieve updated user');
    }

    return updatedUser;
  }

  /**
   * Delete user
   */
  async deleteUser(id: number): Promise<void> {
    const user = await this.getUserById(id);
    if (!user) {
      throw new Error('User not found');
    }

    // Delete user preferences first
    await this.db.prepare('DELETE FROM user_preferences WHERE user_id = ?').bind(id).run();
    
    // Delete user activities
    await this.db.prepare('DELETE FROM user_activities WHERE user_id = ?').bind(id).run();

    // Delete the user
    await this.db.prepare('DELETE FROM users WHERE id = ?').bind(id).run();
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: number, updates: ProfileUpdateRequest): Promise<User> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Update user fields
    const userUpdates: UserUpdateRequest = {};
    if (updates.email) userUpdates.email = updates.email;
    if (updates.first_name) userUpdates.first_name = updates.first_name;
    if (updates.last_name) userUpdates.last_name = updates.last_name;
    if (updates.language) userUpdates.language = updates.language;

    let updatedUser = user;
    if (Object.keys(userUpdates).length > 0) {
      updatedUser = await this.updateUser(userId, userUpdates);
    }

    // Update preferences if provided
    if (updates.preferences) {
      await this.updateUserPreferences(userId, updates.preferences);
    }

    return updatedUser;
  }

  /**
   * Change user password
   */
  async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<void> {
    // Get user with password
    const result = await this.db
      .prepare('SELECT password FROM users WHERE id = ?')
      .bind(userId)
      .first<{ password: string }>();

    if (!result) {
      throw new Error('User not found');
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, result.password);
    if (!isValid) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, this.bcryptRounds);

    // Update password
    await this.db
      .prepare('UPDATE users SET password = ?, updated_at = ? WHERE id = ?')
      .bind(hashedPassword, getCurrentTimestamp(), userId)
      .run();
  }

  /**
   * Get user preferences
   */
  async getUserPreferences(userId: number): Promise<UserPreferences> {
    const result = await this.db
      .prepare(`
        SELECT theme, notifications, language, timezone 
        FROM user_preferences 
        WHERE user_id = ?
      `)
      .bind(userId)
      .first<UserPreferences>();

    return result || {
      theme: 'light',
      notifications: true,
      language: 'en',
      timezone: 'UTC'
    };
  }

  /**
   * Update user preferences
   */
  async updateUserPreferences(userId: number, preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    const current = await this.getUserPreferences(userId);
    const updated = { ...current, ...preferences };

    await this.db
      .prepare(`
        INSERT OR REPLACE INTO user_preferences 
        (user_id, theme, notifications, language, timezone, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `)
      .bind(
        userId,
        updated.theme,
        updated.notifications,
        updated.language,
        updated.timezone,
        getCurrentTimestamp()
      )
      .run();

    return updated;
  }

  /**
   * Create default preferences for new user
   */
  private async createDefaultPreferences(userId: number): Promise<void> {
    await this.db
      .prepare(`
        INSERT INTO user_preferences (user_id, theme, notifications, language, timezone, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `)
      .bind(userId, 'light', true, 'en', 'UTC', getCurrentTimestamp())
      .run();
  }

  /**
   * Get user's effective permissions based on role
   */
  async getUserPermissions(userId: number): Promise<string[]> {
    const user = await this.getUserById(userId);
    if (!user) {
      return [];
    }

    return getRolePermissions(user.role);
  }

  /**
   * Suspend user account
   */
  async suspendUser(userId: number): Promise<void> {
    await this.db
      .prepare('UPDATE users SET suspended_at = ?, updated_at = ? WHERE id = ?')
      .bind(getCurrentTimestamp(), getCurrentTimestamp(), userId)
      .run();
  }

  /**
   * Activate user account
   */
  async activateUser(userId: number): Promise<void> {
    await this.db
      .prepare('UPDATE users SET suspended_at = NULL, updated_at = ? WHERE id = ?')
      .bind(getCurrentTimestamp(), userId)
      .run();
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<{
    total: number;
    active: number;
    suspended: number;
    admins: number;
    users: number;
    moderators: number;
  }> {
    const stats = await this.db
      .prepare(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN suspended_at IS NULL THEN 1 END) as active,
          COUNT(CASE WHEN suspended_at IS NOT NULL THEN 1 END) as suspended,
          COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
          COUNT(CASE WHEN role = 'user' THEN 1 END) as users,
          COUNT(CASE WHEN role = 'moderator' THEN 1 END) as moderators
        FROM users
      `)
      .first<{
        total: number;
        active: number;
        suspended: number;
        admins: number;
        users: number;
        moderators: number;
      }>();

    return stats || {
      total: 0,
      active: 0,
      suspended: 0,
      admins: 0,
      users: 0,
      moderators: 0
    };
  }
}