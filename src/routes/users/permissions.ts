import { CloudflareEnv } from '@/types';
import { RoleService } from '@/services/roleService';
import { PermissionService } from '@/services/permissionService';
import { ActivityService } from '@/services/activityService';
import { requirePermission, requireOwnershipOrPermission } from '@/middleware/permissions';
import { 
  successResponse, 
  errorResponse, 
  handleError, 
  createCorsHeaders 
} from '@/utils';

/**
 * GET /api/users/:id/permissions
 * Get user's effective permissions
 * Requires: users.view permission or own user
 */
export async function getUserPermissions(request: Request, env: CloudflareEnv, userId: string): Promise<Response> {
  try {
    const id = parseInt(userId, 10);
    if (isNaN(id)) {
      return new Response(
        JSON.stringify(errorResponse('Invalid user ID', 'INVALID_ID')),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...createCorsHeaders()
          }
        }
      );
    }

    // Check if user can access this resource
    const authResult = await requireOwnershipOrPermission('users.view')(request, env, id);
    if (!authResult.success) {
      return authResult.response;
    }

    const roleService = new RoleService(env);

    // Get user's effective permissions
    const permissions = await roleService.getUserEffectivePermissions(id);

    // Get user details for context
    const user = await roleService.db
      .prepare('SELECT role, root_admin FROM users WHERE id = ?')
      .bind(id)
      .first<{ role: string; root_admin: boolean }>();

    if (!user) {
      return new Response(
        JSON.stringify(errorResponse('User not found', 'USER_NOT_FOUND')),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            ...createCorsHeaders()
          }
        }
      );
    }

    // Get role details
    const role = await roleService.getRoleByName(user.role);

    const result = {
      user_id: id,
      role: user.role,
      root_admin: user.root_admin,
      role_details: role,
      effective_permissions: permissions,
      permissions_count: permissions.length
    };

    return new Response(
      JSON.stringify(successResponse(result)),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...createCorsHeaders()
        }
      }
    );
  } catch (error) {
    const errorResp = handleError(error);
    return new Response(
      JSON.stringify(errorResp),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...createCorsHeaders()
        }
      }
    );
  }
}

/**
 * GET /api/permissions
 * Get all available permissions
 * Requires: users.view permission
 */
export async function getPermissions(request: Request, env: CloudflareEnv): Promise<Response> {
  try {
    // Authenticate and check permissions
    const authResult = await requirePermission('users.view')(request, env);
    if (!authResult.success) {
      return authResult.response;
    }

    const { context } = authResult;
    const roleService = new RoleService(env);
    const permissionService = new PermissionService(env);

    // Get all permissions
    const permissions = await roleService.getPermissions();

    // Filter permissions based on user's current permissions
    const userPermissions = context.permissions || [];
    const filteredPermissions = permissionService.filterAvailablePermissions(
      userPermissions,
      permissions.map(p => p.name)
    );

    // Only return permissions the user can see/assign
    const result = permissions.filter(permission => 
      filteredPermissions.includes(permission.name)
    );

    // Group permissions by resource for better organization
    const groupedPermissions = result.reduce((acc, permission) => {
      if (!acc[permission.resource]) {
        acc[permission.resource] = [];
      }
      acc[permission.resource].push(permission);
      return acc;
    }, {} as { [key: string]: typeof permissions });

    return new Response(
      JSON.stringify(successResponse({
        permissions: result,
        grouped_permissions: groupedPermissions,
        total_count: result.length
      })),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...createCorsHeaders()
        }
      }
    );
  } catch (error) {
    const errorResp = handleError(error);
    return new Response(
      JSON.stringify(errorResp),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...createCorsHeaders()
        }
      }
    );
  }
}

/**
 * POST /api/permissions/check
 * Check if current user has specific permissions
 * Requires: Authentication
 */
export async function checkPermissions(request: Request, env: CloudflareEnv): Promise<Response> {
  try {
    // Authenticate user
    const authResult = await requirePermission('profile.view')(request, env);
    if (!authResult.success) {
      return authResult.response;
    }

    const { context } = authResult;
    const permissionService = new PermissionService(env);

    // Parse request body
    const body = await request.json();
    const { permissions } = body;

    if (!Array.isArray(permissions)) {
      return new Response(
        JSON.stringify(errorResponse('Permissions must be an array', 'INVALID_INPUT')),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...createCorsHeaders()
          }
        }
      );
    }

    const userPermissions = context.permissions || [];
    const results: { [key: string]: boolean } = {};

    // Check each permission
    for (const permission of permissions) {
      if (typeof permission === 'string') {
        results[permission] = permissionService.hasPermission(userPermissions, permission);
      }
    }

    return new Response(
      JSON.stringify(successResponse({
        user_id: context.user!.id,
        checked_permissions: results,
        has_any: Object.values(results).some(Boolean),
        has_all: Object.values(results).every(Boolean)
      })),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...createCorsHeaders()
        }
      }
    );
  } catch (error) {
    const errorResp = handleError(error);
    return new Response(
      JSON.stringify(errorResp),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...createCorsHeaders()
        }
      }
    );
  }
}

/**
 * GET /api/permissions/resources
 * Get permissions grouped by resource
 * Requires: users.view permission
 */
export async function getPermissionsByResource(request: Request, env: CloudflareEnv): Promise<Response> {
  try {
    // Authenticate and check permissions
    const authResult = await requirePermission('users.view')(request, env);
    if (!authResult.success) {
      return authResult.response;
    }

    const { context } = authResult;
    const roleService = new RoleService(env);
    const permissionService = new PermissionService(env);

    // Get URL parameters
    const url = new URL(request.url);
    const resource = url.searchParams.get('resource');

    let permissions;
    if (resource) {
      // Get permissions for specific resource
      permissions = await roleService.getPermissionsByResource(resource);
    } else {
      // Get all permissions
      permissions = await roleService.getPermissions();
    }

    // Filter permissions based on user's current permissions
    const userPermissions = context.permissions || [];
    const filteredPermissionNames = permissionService.filterAvailablePermissions(
      userPermissions,
      permissions.map(p => p.name)
    );

    const filteredPermissions = permissions.filter(permission => 
      filteredPermissionNames.includes(permission.name)
    );

    // Group by resource
    const groupedPermissions = filteredPermissions.reduce((acc, permission) => {
      if (!acc[permission.resource]) {
        acc[permission.resource] = {
          resource: permission.resource,
          permissions: []
        };
      }
      acc[permission.resource].permissions.push({
        name: permission.name,
        description: permission.description,
        action: permission.action
      });
      return acc;
    }, {} as { [key: string]: { resource: string; permissions: any[] } });

    const result = Object.values(groupedPermissions);

    return new Response(
      JSON.stringify(successResponse({
        resources: result,
        total_resources: result.length,
        total_permissions: filteredPermissions.length,
        filtered_by_resource: !!resource
      })),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...createCorsHeaders()
        }
      }
    );
  } catch (error) {
    const errorResp = handleError(error);
    return new Response(
      JSON.stringify(errorResp),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...createCorsHeaders()
        }
      }
    );
  }
}

/**
 * GET /api/permissions/stats
 * Get permission statistics
 * Requires: admin.view permission
 */
export async function getPermissionStats(request: Request, env: CloudflareEnv): Promise<Response> {
  try {
    // Authenticate and check permissions
    const authResult = await requirePermission('admin.view')(request, env);
    if (!authResult.success) {
      return authResult.response;
    }

    const roleService = new RoleService(env);

    // Get role statistics
    const stats = await roleService.getRoleStats();

    // Get additional permission breakdown
    const permissions = await roleService.getPermissions();
    const resourceBreakdown = permissions.reduce((acc, permission) => {
      acc[permission.resource] = (acc[permission.resource] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    const result = {
      ...stats,
      permission_breakdown: resourceBreakdown,
      resources_count: Object.keys(resourceBreakdown).length
    };

    return new Response(
      JSON.stringify(successResponse(result)),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...createCorsHeaders()
        }
      }
    );
  } catch (error) {
    const errorResp = handleError(error);
    return new Response(
      JSON.stringify(errorResp),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...createCorsHeaders()
        }
      }
    );
  }
}

/**
 * GET /api/users/:id/activity
 * Get user activity log
 * Requires: users.view_activity permission or own user
 */
export async function getUserActivity(request: Request, env: CloudflareEnv, userId: string): Promise<Response> {
  try {
    const id = parseInt(userId, 10);
    if (isNaN(id)) {
      return new Response(
        JSON.stringify(errorResponse('Invalid user ID', 'INVALID_ID')),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...createCorsHeaders()
          }
        }
      );
    }

    // Check if user can access this resource
    const authResult = await requireOwnershipOrPermission('users.view_activity')(request, env, id);
    if (!authResult.success) {
      return authResult.response;
    }

    const activityService = new ActivityService(env);

    // Extract pagination parameters
    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '10', 10)));
    const search = url.searchParams.get('search') || undefined;

    // Get user activities
    const result = await activityService.getUserActivities(id, {
      page,
      limit,
      search
    });

    return new Response(
      JSON.stringify(successResponse(result)),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...createCorsHeaders()
        }
      }
    );
  } catch (error) {
    const errorResp = handleError(error);
    return new Response(
      JSON.stringify(errorResp),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...createCorsHeaders()
        }
      }
    );
  }
}