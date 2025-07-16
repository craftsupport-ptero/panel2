import { UserActivity, CloudflareEnv, PaginatedResponse, PaginationParams } from '@/types';
import { getCurrentTimestamp } from '@/utils';

export class ActivityService {
  private db: D1Database;

  constructor(env: CloudflareEnv) {
    this.db = env.DB;
  }

  /**
   * Log user activity
   */
  async logActivity(
    userId: number,
    action: string,
    details?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.db
      .prepare(`
        INSERT INTO user_activities (user_id, action, details, ip_address, user_agent, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `)
      .bind(
        userId,
        action,
        details || null,
        ipAddress || null,
        userAgent || null,
        getCurrentTimestamp()
      )
      .run();
  }

  /**
   * Get user activities with pagination
   */
  async getUserActivities(
    userId: number,
    params: PaginationParams
  ): Promise<PaginatedResponse<UserActivity>> {
    // Count total records
    const countResult = await this.db
      .prepare('SELECT COUNT(*) as total FROM user_activities WHERE user_id = ?')
      .bind(userId)
      .first<{ total: number }>();
    
    const total = countResult?.total || 0;

    // Get activities with pagination
    const page = params.page || 1;
    const limit = params.limit || 10;
    const offset = (page - 1) * limit;

    let query = `
      SELECT id, user_id, action, details, ip_address, user_agent, created_at
      FROM user_activities
      WHERE user_id = ?
    `;

    // Add search filter
    const queryParams: any[] = [userId];
    if (params.search) {
      query += ' AND action LIKE ?';
      queryParams.push(`%${params.search}%`);
    }

    // Add sorting
    const sortField = params.sort || 'created_at';
    const sortOrder = params.order || 'desc';
    query += ` ORDER BY ${sortField} ${sortOrder.toUpperCase()}`;

    // Add pagination
    query += ' LIMIT ? OFFSET ?';
    queryParams.push(limit, offset);

    const result = await this.db.prepare(query).bind(...queryParams).all<UserActivity>();
    const activities = result.results || [];

    return {
      data: activities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get all activities with pagination (admin only)
   */
  async getAllActivities(params: PaginationParams): Promise<PaginatedResponse<UserActivity & { username: string }>> {
    // Build base query
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM user_activities ua
      JOIN users u ON ua.user_id = u.id
      WHERE 1=1
    `;

    let query = `
      SELECT 
        ua.id, ua.user_id, ua.action, ua.details, ua.ip_address, 
        ua.user_agent, ua.created_at, u.username
      FROM user_activities ua
      JOIN users u ON ua.user_id = u.id
      WHERE 1=1
    `;

    const queryParams: any[] = [];

    // Add search filter
    if (params.search) {
      const searchCondition = ' AND (ua.action LIKE ? OR u.username LIKE ?)';
      countQuery += searchCondition;
      query += searchCondition;
      queryParams.push(`%${params.search}%`, `%${params.search}%`);
    }

    // Count total records
    const countResult = await this.db
      .prepare(countQuery)
      .bind(...queryParams)
      .first<{ total: number }>();
    
    const total = countResult?.total || 0;

    // Add sorting
    const sortField = params.sort || 'created_at';
    const sortOrder = params.order || 'desc';
    query += ` ORDER BY ua.${sortField} ${sortOrder.toUpperCase()}`;

    // Add pagination
    const page = params.page || 1;
    const limit = params.limit || 10;
    const offset = (page - 1) * limit;
    query += ' LIMIT ? OFFSET ?';
    queryParams.push(limit, offset);

    const result = await this.db
      .prepare(query)
      .bind(...queryParams)
      .all<UserActivity & { username: string }>();
    
    const activities = result.results || [];

    return {
      data: activities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get recent activities for a user
   */
  async getRecentActivities(userId: number, limit: number = 10): Promise<UserActivity[]> {
    const result = await this.db
      .prepare(`
        SELECT id, user_id, action, details, ip_address, user_agent, created_at
        FROM user_activities
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT ?
      `)
      .bind(userId, limit)
      .all<UserActivity>();

    return result.results || [];
  }

  /**
   * Delete old activities (cleanup)
   */
  async cleanupOldActivities(daysToKeep: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.db
      .prepare('DELETE FROM user_activities WHERE created_at < ?')
      .bind(cutoffDate.toISOString())
      .run();

    return result.changes || 0;
  }

  /**
   * Get activity statistics
   */
  async getActivityStats(days: number = 30): Promise<{
    total_activities: number;
    unique_users: number;
    top_actions: Array<{ action: string; count: number }>;
    daily_activities: Array<{ date: string; count: number }>;
  }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    // Get total activities and unique users
    const totalStats = await this.db
      .prepare(`
        SELECT 
          COUNT(*) as total_activities,
          COUNT(DISTINCT user_id) as unique_users
        FROM user_activities
        WHERE created_at >= ?
      `)
      .bind(cutoffDate.toISOString())
      .first<{ total_activities: number; unique_users: number }>();

    // Get top actions
    const topActionsResult = await this.db
      .prepare(`
        SELECT action, COUNT(*) as count
        FROM user_activities
        WHERE created_at >= ?
        GROUP BY action
        ORDER BY count DESC
        LIMIT 10
      `)
      .bind(cutoffDate.toISOString())
      .all<{ action: string; count: number }>();

    // Get daily activities
    const dailyActivitiesResult = await this.db
      .prepare(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as count
        FROM user_activities
        WHERE created_at >= ?
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `)
      .bind(cutoffDate.toISOString())
      .all<{ date: string; count: number }>();

    return {
      total_activities: totalStats?.total_activities || 0,
      unique_users: totalStats?.unique_users || 0,
      top_actions: topActionsResult.results || [],
      daily_activities: dailyActivitiesResult.results || []
    };
  }

  /**
   * Log common user actions
   */
  async logLogin(userId: number, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.logActivity(userId, 'user.login', 'User logged in', ipAddress, userAgent);
  }

  async logLogout(userId: number, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.logActivity(userId, 'user.logout', 'User logged out', ipAddress, userAgent);
  }

  async logPasswordChange(userId: number, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.logActivity(userId, 'user.password_change', 'User changed password', ipAddress, userAgent);
  }

  async logProfileUpdate(userId: number, changes: string[], ipAddress?: string, userAgent?: string): Promise<void> {
    const details = `Updated: ${changes.join(', ')}`;
    await this.logActivity(userId, 'user.profile_update', details, ipAddress, userAgent);
  }

  async logUserCreated(adminUserId: number, createdUserId: number, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.logActivity(
      adminUserId,
      'admin.user_created',
      `Created user ID: ${createdUserId}`,
      ipAddress,
      userAgent
    );
  }

  async logUserUpdated(adminUserId: number, updatedUserId: number, changes: string[], ipAddress?: string, userAgent?: string): Promise<void> {
    const details = `Updated user ID: ${updatedUserId}, Changes: ${changes.join(', ')}`;
    await this.logActivity(adminUserId, 'admin.user_updated', details, ipAddress, userAgent);
  }

  async logUserDeleted(adminUserId: number, deletedUserId: number, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.logActivity(
      adminUserId,
      'admin.user_deleted',
      `Deleted user ID: ${deletedUserId}`,
      ipAddress,
      userAgent
    );
  }

  async logUserSuspended(adminUserId: number, suspendedUserId: number, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.logActivity(
      adminUserId,
      'admin.user_suspended',
      `Suspended user ID: ${suspendedUserId}`,
      ipAddress,
      userAgent
    );
  }

  async logUserActivated(adminUserId: number, activatedUserId: number, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.logActivity(
      adminUserId,
      'admin.user_activated',
      `Activated user ID: ${activatedUserId}`,
      ipAddress,
      userAgent
    );
  }

  async logRoleChanged(adminUserId: number, targetUserId: number, oldRole: string, newRole: string, ipAddress?: string, userAgent?: string): Promise<void> {
    const details = `Changed role for user ID: ${targetUserId} from ${oldRole} to ${newRole}`;
    await this.logActivity(adminUserId, 'admin.role_changed', details, ipAddress, userAgent);
  }

  async logAvatarUpload(userId: number, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.logActivity(userId, 'user.avatar_upload', 'User uploaded new avatar', ipAddress, userAgent);
  }

  async logSettingsUpdate(userId: number, settings: string[], ipAddress?: string, userAgent?: string): Promise<void> {
    const details = `Updated settings: ${settings.join(', ')}`;
    await this.logActivity(userId, 'user.settings_update', details, ipAddress, userAgent);
  }
}