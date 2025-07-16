import { Role, Permission, CloudflareEnv } from '@/types';
import { SYSTEM_PERMISSIONS, SYSTEM_ROLES, getRolePermissions } from '@/schemas/roles';
import { getCurrentTimestamp } from '@/utils';

export class RoleService {
  private db: D1Database;

  constructor(env: CloudflareEnv) {
    this.db = env.DB;
  }

  /**
   * Get all available roles
   */
  async getRoles(): Promise<Role[]> {
    const result = await this.db
      .prepare(`
        SELECT id, name, description, permissions, created_at, updated_at
        FROM roles
        ORDER BY name
      `)
      .all<Role & { permissions: string }>();

    return (result.results || []).map(role => ({
      ...role,
      permissions: role.permissions ? JSON.parse(role.permissions) : []
    }));
  }

  /**
   * Get role by name
   */
  async getRoleByName(name: string): Promise<Role | null> {
    const result = await this.db
      .prepare(`
        SELECT id, name, description, permissions, created_at, updated_at
        FROM roles
        WHERE name = ?
      `)
      .bind(name)
      .first<Role & { permissions: string }>();

    if (!result) return null;

    return {
      ...result,
      permissions: result.permissions ? JSON.parse(result.permissions) : []
    };
  }

  /**
   * Get role by ID
   */
  async getRoleById(id: number): Promise<Role | null> {
    const result = await this.db
      .prepare(`
        SELECT id, name, description, permissions, created_at, updated_at
        FROM roles
        WHERE id = ?
      `)
      .bind(id)
      .first<Role & { permissions: string }>();

    if (!result) return null;

    return {
      ...result,
      permissions: result.permissions ? JSON.parse(result.permissions) : []
    };
  }

  /**
   * Create a new role
   */
  async createRole(name: string, description: string, permissions: string[]): Promise<Role> {
    // Check if role already exists
    const existing = await this.getRoleByName(name);
    if (existing) {
      throw new Error('Role already exists');
    }

    // Validate permissions
    const invalidPermissions = permissions.filter(p => !Object.keys(SYSTEM_PERMISSIONS).includes(p));
    if (invalidPermissions.length > 0) {
      throw new Error(`Invalid permissions: ${invalidPermissions.join(', ')}`);
    }

    const now = getCurrentTimestamp();
    const result = await this.db
      .prepare(`
        INSERT INTO roles (name, description, permissions, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?)
        RETURNING id
      `)
      .bind(name, description, JSON.stringify(permissions), now, now)
      .first<{ id: number }>();

    if (!result?.id) {
      throw new Error('Failed to create role');
    }

    const role = await this.getRoleById(result.id);
    if (!role) {
      throw new Error('Failed to retrieve created role');
    }

    return role;
  }

  /**
   * Update role
   */
  async updateRole(id: number, updates: { name?: string; description?: string; permissions?: string[] }): Promise<Role> {
    const role = await this.getRoleById(id);
    if (!role) {
      throw new Error('Role not found');
    }

    // Check if name is being changed and already exists
    if (updates.name && updates.name !== role.name) {
      const existing = await this.getRoleByName(updates.name);
      if (existing) {
        throw new Error('Role name already exists');
      }
    }

    // Validate permissions if provided
    if (updates.permissions) {
      const invalidPermissions = updates.permissions.filter(p => !Object.keys(SYSTEM_PERMISSIONS).includes(p));
      if (invalidPermissions.length > 0) {
        throw new Error(`Invalid permissions: ${invalidPermissions.join(', ')}`);
      }
    }

    // Build update query
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (updates.name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(updates.name);
    }
    if (updates.description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(updates.description);
    }
    if (updates.permissions !== undefined) {
      updateFields.push('permissions = ?');
      updateValues.push(JSON.stringify(updates.permissions));
    }

    if (updateFields.length === 0) {
      return role; // No updates needed
    }

    updateFields.push('updated_at = ?');
    updateValues.push(getCurrentTimestamp());
    updateValues.push(id); // For WHERE clause

    const query = `UPDATE roles SET ${updateFields.join(', ')} WHERE id = ?`;
    await this.db.prepare(query).bind(...updateValues).run();

    // Return updated role
    const updatedRole = await this.getRoleById(id);
    if (!updatedRole) {
      throw new Error('Failed to retrieve updated role');
    }

    return updatedRole;
  }

  /**
   * Delete role
   */
  async deleteRole(id: number): Promise<void> {
    const role = await this.getRoleById(id);
    if (!role) {
      throw new Error('Role not found');
    }

    // Check if role is in use
    const usersWithRole = await this.db
      .prepare('SELECT COUNT(*) as count FROM users WHERE role = ?')
      .bind(role.name)
      .first<{ count: number }>();

    if (usersWithRole && usersWithRole.count > 0) {
      throw new Error('Cannot delete role that is assigned to users');
    }

    await this.db.prepare('DELETE FROM roles WHERE id = ?').bind(id).run();
  }

  /**
   * Get all available permissions
   */
  async getPermissions(): Promise<Permission[]> {
    const result = await this.db
      .prepare(`
        SELECT id, name, description, resource, action
        FROM permissions
        ORDER BY resource, action
      `)
      .all<Permission>();

    return result.results || [];
  }

  /**
   * Get permissions by resource
   */
  async getPermissionsByResource(resource: string): Promise<Permission[]> {
    const result = await this.db
      .prepare(`
        SELECT id, name, description, resource, action
        FROM permissions
        WHERE resource = ?
        ORDER BY action
      `)
      .bind(resource)
      .all<Permission>();

    return result.results || [];
  }

  /**
   * Create a new permission
   */
  async createPermission(name: string, description: string, resource: string, action: string): Promise<Permission> {
    // Check if permission already exists
    const existing = await this.db
      .prepare('SELECT id FROM permissions WHERE name = ?')
      .bind(name)
      .first<{ id: number }>();

    if (existing) {
      throw new Error('Permission already exists');
    }

    const result = await this.db
      .prepare(`
        INSERT INTO permissions (name, description, resource, action)
        VALUES (?, ?, ?, ?)
        RETURNING id
      `)
      .bind(name, description, resource, action)
      .first<{ id: number }>();

    if (!result?.id) {
      throw new Error('Failed to create permission');
    }

    const permission = await this.db
      .prepare(`
        SELECT id, name, description, resource, action
        FROM permissions
        WHERE id = ?
      `)
      .bind(result.id)
      .first<Permission>();

    if (!permission) {
      throw new Error('Failed to retrieve created permission');
    }

    return permission;
  }

  /**
   * Initialize system roles and permissions
   */
  async initializeSystemRoles(): Promise<void> {
    // First, create all system permissions
    for (const [name, description] of Object.entries(SYSTEM_PERMISSIONS)) {
      const [resource, action] = name.split('.');
      
      try {
        await this.createPermission(name, description, resource, action);
      } catch (error) {
        // Permission might already exist, continue
        if (!(error as Error).message.includes('already exists')) {
          console.error(`Failed to create permission ${name}:`, error);
        }
      }
    }

    // Then, create system roles
    for (const [roleName, roleData] of Object.entries(SYSTEM_ROLES)) {
      try {
        await this.createRole(roleName, roleData.description, roleData.permissions);
      } catch (error) {
        // Role might already exist, continue
        if (!(error as Error).message.includes('already exists')) {
          console.error(`Failed to create role ${roleName}:`, error);
        }
      }
    }
  }

  /**
   * Update user role
   */
  async updateUserRole(userId: number, role: string, rootAdmin: boolean = false): Promise<void> {
    // Validate role exists in system roles
    if (!Object.keys(SYSTEM_ROLES).includes(role)) {
      throw new Error('Invalid role');
    }

    await this.db
      .prepare('UPDATE users SET role = ?, root_admin = ?, updated_at = ? WHERE id = ?')
      .bind(role, rootAdmin, getCurrentTimestamp(), userId)
      .run();
  }

  /**
   * Get user's effective permissions
   */
  async getUserEffectivePermissions(userId: number): Promise<string[]> {
    const user = await this.db
      .prepare('SELECT role, root_admin FROM users WHERE id = ?')
      .bind(userId)
      .first<{ role: string; root_admin: boolean }>();

    if (!user) {
      return [];
    }

    // Root admin has all permissions
    if (user.root_admin) {
      return Object.keys(SYSTEM_PERMISSIONS);
    }

    // Get role permissions
    return getRolePermissions(user.role);
  }

  /**
   * Check if user has specific permission
   */
  async userHasPermission(userId: number, permission: string): Promise<boolean> {
    const permissions = await this.getUserEffectivePermissions(userId);
    return permissions.includes(permission) || permissions.includes('admin.*');
  }

  /**
   * Check if user has any of the specified permissions
   */
  async userHasAnyPermission(userId: number, permissions: string[]): Promise<boolean> {
    const userPermissions = await this.getUserEffectivePermissions(userId);
    return permissions.some(permission => 
      userPermissions.includes(permission) || userPermissions.includes('admin.*')
    );
  }

  /**
   * Check if user has all of the specified permissions
   */
  async userHasAllPermissions(userId: number, permissions: string[]): Promise<boolean> {
    const userPermissions = await this.getUserEffectivePermissions(userId);
    return permissions.every(permission => 
      userPermissions.includes(permission) || userPermissions.includes('admin.*')
    );
  }

  /**
   * Get role statistics
   */
  async getRoleStats(): Promise<{
    total_roles: number;
    total_permissions: number;
    role_distribution: Array<{ role: string; count: number }>;
  }> {
    // Get total roles and permissions
    const totalRoles = await this.db
      .prepare('SELECT COUNT(*) as count FROM roles')
      .first<{ count: number }>();

    const totalPermissions = await this.db
      .prepare('SELECT COUNT(*) as count FROM permissions')
      .first<{ count: number }>();

    // Get role distribution
    const roleDistribution = await this.db
      .prepare(`
        SELECT role, COUNT(*) as count
        FROM users
        GROUP BY role
        ORDER BY count DESC
      `)
      .all<{ role: string; count: number }>();

    return {
      total_roles: totalRoles?.count || 0,
      total_permissions: totalPermissions?.count || 0,
      role_distribution: roleDistribution.results || []
    };
  }
}