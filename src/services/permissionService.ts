import { CloudflareEnv, RequestContext } from '@/types';
import { hasPermission, hasAnyPermission, hasAllPermissions } from '@/schemas/roles';

export class PermissionService {
  private env: CloudflareEnv;

  constructor(env: CloudflareEnv) {
    this.env = env;
  }

  /**
   * Check if user has a specific permission
   */
  hasPermission(userPermissions: string[], permission: string): boolean {
    return hasPermission(userPermissions, permission);
  }

  /**
   * Check if user has any of the specified permissions
   */
  hasAnyPermission(userPermissions: string[], permissions: string[]): boolean {
    return hasAnyPermission(userPermissions, permissions);
  }

  /**
   * Check if user has all of the specified permissions
   */
  hasAllPermissions(userPermissions: string[], permissions: string[]): boolean {
    return hasAllPermissions(userPermissions, permissions);
  }

  /**
   * Check if user can access resource (ownership or permission)
   */
  canAccessResource(
    context: RequestContext,
    resourceUserId: number,
    requiredPermission?: string
  ): boolean {
    if (!context.user || !context.permissions) {
      return false;
    }

    // User can always access their own resources
    if (context.user.id === resourceUserId) {
      return true;
    }

    // Check if user has the required permission
    if (requiredPermission && this.hasPermission(context.permissions, requiredPermission)) {
      return true;
    }

    return false;
  }

  /**
   * Check user management permissions
   */
  canViewUsers(userPermissions: string[]): boolean {
    return this.hasPermission(userPermissions, 'users.view');
  }

  canCreateUsers(userPermissions: string[]): boolean {
    return this.hasPermission(userPermissions, 'users.create');
  }

  canEditUsers(userPermissions: string[]): boolean {
    return this.hasPermission(userPermissions, 'users.edit');
  }

  canDeleteUsers(userPermissions: string[]): boolean {
    return this.hasPermission(userPermissions, 'users.delete');
  }

  canManageRoles(userPermissions: string[]): boolean {
    return this.hasPermission(userPermissions, 'users.manage_roles');
  }

  canViewUserActivity(userPermissions: string[]): boolean {
    return this.hasPermission(userPermissions, 'users.view_activity');
  }

  /**
   * Check profile management permissions
   */
  canEditProfile(userPermissions: string[]): boolean {
    return this.hasPermission(userPermissions, 'profile.edit');
  }

  canChangePassword(userPermissions: string[]): boolean {
    return this.hasPermission(userPermissions, 'profile.change_password');
  }

  canUploadAvatar(userPermissions: string[]): boolean {
    return this.hasPermission(userPermissions, 'profile.upload_avatar');
  }

  canViewSettings(userPermissions: string[]): boolean {
    return this.hasPermission(userPermissions, 'profile.view_settings');
  }

  canEditSettings(userPermissions: string[]): boolean {
    return this.hasPermission(userPermissions, 'profile.edit_settings');
  }

  /**
   * Check server management permissions (for future phases)
   */
  canViewServers(userPermissions: string[]): boolean {
    return this.hasPermission(userPermissions, 'servers.view');
  }

  canCreateServers(userPermissions: string[]): boolean {
    return this.hasPermission(userPermissions, 'servers.create');
  }

  canEditServers(userPermissions: string[]): boolean {
    return this.hasPermission(userPermissions, 'servers.edit');
  }

  canDeleteServers(userPermissions: string[]): boolean {
    return this.hasPermission(userPermissions, 'servers.delete');
  }

  canManageServers(userPermissions: string[]): boolean {
    return this.hasPermission(userPermissions, 'servers.manage');
  }

  canAccessConsole(userPermissions: string[]): boolean {
    return this.hasPermission(userPermissions, 'servers.console');
  }

  canManageFiles(userPermissions: string[]): boolean {
    return this.hasPermission(userPermissions, 'servers.files');
  }

  canManageDatabases(userPermissions: string[]): boolean {
    return this.hasPermission(userPermissions, 'servers.databases');
  }

  canManageSchedules(userPermissions: string[]): boolean {
    return this.hasPermission(userPermissions, 'servers.schedules');
  }

  canManageBackups(userPermissions: string[]): boolean {
    return this.hasPermission(userPermissions, 'servers.backups');
  }

  /**
   * Check node management permissions (for future phases)
   */
  canViewNodes(userPermissions: string[]): boolean {
    return this.hasPermission(userPermissions, 'nodes.view');
  }

  canCreateNodes(userPermissions: string[]): boolean {
    return this.hasPermission(userPermissions, 'nodes.create');
  }

  canEditNodes(userPermissions: string[]): boolean {
    return this.hasPermission(userPermissions, 'nodes.edit');
  }

  canDeleteNodes(userPermissions: string[]): boolean {
    return this.hasPermission(userPermissions, 'nodes.delete');
  }

  canManageNodes(userPermissions: string[]): boolean {
    return this.hasPermission(userPermissions, 'nodes.manage');
  }

  canManageAllocations(userPermissions: string[]): boolean {
    return this.hasPermission(userPermissions, 'nodes.allocations');
  }

  /**
   * Check administrative permissions
   */
  canViewAdmin(userPermissions: string[]): boolean {
    return this.hasPermission(userPermissions, 'admin.view');
  }

  canManageSettings(userPermissions: string[]): boolean {
    return this.hasPermission(userPermissions, 'admin.settings');
  }

  canAdminUsers(userPermissions: string[]): boolean {
    return this.hasPermission(userPermissions, 'admin.users');
  }

  canAdminServers(userPermissions: string[]): boolean {
    return this.hasPermission(userPermissions, 'admin.servers');
  }

  canAdminNodes(userPermissions: string[]): boolean {
    return this.hasPermission(userPermissions, 'admin.nodes');
  }

  canViewSystemActivity(userPermissions: string[]): boolean {
    return this.hasPermission(userPermissions, 'admin.activity');
  }

  canManageApi(userPermissions: string[]): boolean {
    return this.hasPermission(userPermissions, 'admin.api');
  }

  /**
   * Get permission description for error messages
   */
  getPermissionDescription(permission: string): string {
    const descriptions: { [key: string]: string } = {
      'users.view': 'view users',
      'users.create': 'create users',
      'users.edit': 'edit users',
      'users.delete': 'delete users',
      'users.manage_roles': 'manage user roles',
      'users.view_activity': 'view user activity',
      'profile.edit': 'edit profile',
      'profile.change_password': 'change password',
      'profile.upload_avatar': 'upload avatar',
      'profile.view_settings': 'view settings',
      'profile.edit_settings': 'edit settings',
      'servers.view': 'view servers',
      'servers.create': 'create servers',
      'servers.edit': 'edit servers',
      'servers.delete': 'delete servers',
      'servers.manage': 'manage servers',
      'servers.console': 'access server console',
      'servers.files': 'manage server files',
      'servers.databases': 'manage server databases',
      'servers.schedules': 'manage server schedules',
      'servers.backups': 'manage server backups',
      'nodes.view': 'view nodes',
      'nodes.create': 'create nodes',
      'nodes.edit': 'edit nodes',
      'nodes.delete': 'delete nodes',
      'nodes.manage': 'manage nodes',
      'nodes.allocations': 'manage allocations',
      'admin.view': 'access admin panel',
      'admin.settings': 'manage settings',
      'admin.users': 'admin user management',
      'admin.servers': 'admin server management',
      'admin.nodes': 'admin node management',
      'admin.activity': 'view system activity',
      'admin.api': 'manage API access'
    };

    return descriptions[permission] || permission;
  }

  /**
   * Check if permission is resource-scoped
   */
  isResourceScopedPermission(permission: string): boolean {
    const resourceScopedPermissions = [
      'servers.view',
      'servers.edit',
      'servers.delete',
      'servers.console',
      'servers.files',
      'servers.databases',
      'servers.schedules',
      'servers.backups'
    ];

    return resourceScopedPermissions.includes(permission);
  }

  /**
   * Check if user can perform bulk operations
   */
  canPerformBulkOperations(userPermissions: string[]): boolean {
    return this.hasAnyPermission(userPermissions, [
      'admin.users',
      'users.edit',
      'users.delete'
    ]);
  }

  /**
   * Check if user can impersonate other users
   */
  canImpersonateUsers(userPermissions: string[]): boolean {
    return this.hasPermission(userPermissions, 'admin.users');
  }

  /**
   * Check if user can view sensitive information
   */
  canViewSensitiveInfo(userPermissions: string[]): boolean {
    return this.hasAnyPermission(userPermissions, [
      'admin.view',
      'admin.users',
      'users.view_activity'
    ]);
  }

  /**
   * Filter permissions based on user's current permissions
   */
  filterAvailablePermissions(userPermissions: string[], allPermissions: string[]): string[] {
    // Root admin can see all permissions
    if (this.hasPermission(userPermissions, 'admin.*')) {
      return allPermissions;
    }

    // Users can only assign permissions they have themselves
    return allPermissions.filter(permission => 
      this.hasPermission(userPermissions, permission)
    );
  }

  /**
   * Get maximum role a user can assign
   */
  getMaxAssignableRole(userPermissions: string[]): string {
    if (this.hasPermission(userPermissions, 'admin.users')) {
      return 'admin';
    }
    if (this.hasPermission(userPermissions, 'users.manage_roles')) {
      return 'moderator';
    }
    return 'user';
  }

  /**
   * Check if user can assign specific role
   */
  canAssignRole(userPermissions: string[], targetRole: string): boolean {
    const maxRole = this.getMaxAssignableRole(userPermissions);
    
    const roleHierarchy: { [key: string]: number } = {
      'user': 1,
      'moderator': 2,
      'admin': 3
    };

    return roleHierarchy[targetRole] <= roleHierarchy[maxRole];
  }
}