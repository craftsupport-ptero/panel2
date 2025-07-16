import { z } from 'zod';

// Role validation schemas
export const RoleCreateSchema = z.object({
  name: z.string()
    .min(3, 'Role name must be at least 3 characters')
    .max(50, 'Role name must not exceed 50 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Role name can only contain letters, numbers, underscores, and hyphens'),
  description: z.string()
    .min(1, 'Description is required')
    .max(255, 'Description must not exceed 255 characters'),
  permissions: z.array(z.string()).min(1, 'At least one permission is required')
});

export const RoleUpdateSchema = z.object({
  name: z.string()
    .min(3, 'Role name must be at least 3 characters')
    .max(50, 'Role name must not exceed 50 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Role name can only contain letters, numbers, underscores, and hyphens')
    .optional(),
  description: z.string()
    .min(1, 'Description is required')
    .max(255, 'Description must not exceed 255 characters')
    .optional(),
  permissions: z.array(z.string()).min(1, 'At least one permission is required').optional()
});

export const PermissionCreateSchema = z.object({
  name: z.string()
    .min(3, 'Permission name must be at least 3 characters')
    .max(100, 'Permission name must not exceed 100 characters')
    .regex(/^[a-zA-Z0-9_.-]+$/, 'Permission name can only contain letters, numbers, underscores, dots, and hyphens'),
  description: z.string()
    .min(1, 'Description is required')
    .max(255, 'Description must not exceed 255 characters'),
  resource: z.string()
    .min(1, 'Resource is required')
    .max(50, 'Resource must not exceed 50 characters'),
  action: z.string()
    .min(1, 'Action is required')
    .max(50, 'Action must not exceed 50 characters')
});

// Predefined permissions for the system
export const SYSTEM_PERMISSIONS = {
  // User management permissions
  'users.view': 'View user information',
  'users.create': 'Create new users',
  'users.edit': 'Edit user information',
  'users.delete': 'Delete users',
  'users.manage_roles': 'Manage user roles and permissions',
  'users.view_activity': 'View user activity logs',
  
  // Profile management permissions
  'profile.edit': 'Edit own profile',
  'profile.change_password': 'Change own password',
  'profile.upload_avatar': 'Upload profile avatar',
  'profile.view_settings': 'View profile settings',
  'profile.edit_settings': 'Edit profile settings',
  
  // Server management permissions (for future phases)
  'servers.view': 'View servers',
  'servers.create': 'Create servers',
  'servers.edit': 'Edit server settings',
  'servers.delete': 'Delete servers',
  'servers.manage': 'Full server management',
  'servers.console': 'Access server console',
  'servers.files': 'Manage server files',
  'servers.databases': 'Manage server databases',
  'servers.schedules': 'Manage server schedules',
  'servers.backups': 'Manage server backups',
  
  // Node management permissions (for future phases)
  'nodes.view': 'View nodes',
  'nodes.create': 'Create nodes',
  'nodes.edit': 'Edit node settings',
  'nodes.delete': 'Delete nodes',
  'nodes.manage': 'Full node management',
  'nodes.allocations': 'Manage node allocations',
  
  // Administrative permissions
  'admin.view': 'View administrative interface',
  'admin.settings': 'Manage system settings',
  'admin.users': 'Administrative user management',
  'admin.servers': 'Administrative server management',
  'admin.nodes': 'Administrative node management',
  'admin.activity': 'View system activity logs',
  'admin.api': 'Manage API keys and access'
};

// Predefined roles with their default permissions
export const SYSTEM_ROLES = {
  admin: {
    name: 'Administrator',
    description: 'Full system access with all permissions',
    permissions: Object.keys(SYSTEM_PERMISSIONS)
  },
  moderator: {
    name: 'Moderator',
    description: 'Limited administrative access for user and server management',
    permissions: [
      'users.view',
      'users.edit',
      'users.view_activity',
      'profile.edit',
      'profile.change_password',
      'profile.upload_avatar',
      'profile.view_settings',
      'profile.edit_settings',
      'servers.view',
      'servers.edit',
      'servers.console',
      'servers.files',
      'servers.databases',
      'servers.schedules',
      'servers.backups',
      'nodes.view'
    ]
  },
  user: {
    name: 'User',
    description: 'Standard user with basic server management permissions',
    permissions: [
      'profile.edit',
      'profile.change_password',
      'profile.upload_avatar',
      'profile.view_settings',
      'profile.edit_settings',
      'servers.view',
      'servers.console',
      'servers.files',
      'servers.databases',
      'servers.schedules',
      'servers.backups'
    ]
  }
};

// Permission validation functions
export function validatePermissions(permissions: string[]): boolean {
  return permissions.every(permission => 
    Object.keys(SYSTEM_PERMISSIONS).includes(permission)
  );
}

export function getRolePermissions(role: string): string[] {
  const systemRole = SYSTEM_ROLES[role as keyof typeof SYSTEM_ROLES];
  return systemRole ? systemRole.permissions : [];
}

export function hasPermission(userPermissions: string[], requiredPermission: string): boolean {
  return userPermissions.includes(requiredPermission) || userPermissions.includes('admin.*');
}

export function hasAnyPermission(userPermissions: string[], requiredPermissions: string[]): boolean {
  return requiredPermissions.some(permission => hasPermission(userPermissions, permission));
}

export function hasAllPermissions(userPermissions: string[], requiredPermissions: string[]): boolean {
  return requiredPermissions.every(permission => hasPermission(userPermissions, permission));
}

// Export all schemas
export const RoleSchemas = {
  RoleCreateSchema,
  RoleUpdateSchema,
  PermissionCreateSchema
};