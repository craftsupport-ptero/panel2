import { CloudflareEnv } from '@/types';
import { UserService } from '@/services/userService';
import { RoleService } from '@/services/roleService';
import { ActivityService } from '@/services/activityService';
import { PermissionService } from '@/services/permissionService';
import { UserRoleUpdateSchema, validateRequest } from '@/schemas/users';
import { requirePermission, requireOwnershipOrPermission } from '@/middleware/permissions';
import { 
  successResponse, 
  errorResponse, 
  handleError, 
  createCorsHeaders 
} from '@/utils';

/**
 * GET /api/users/:id/roles
 * Get user's roles and permissions
 * Requires: users.view permission or own user
 */
export async function getUserRoles(request: Request, env: CloudflareEnv, userId: string): Promise<Response> {
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

    const userService = new UserService(env);
    const roleService = new RoleService(env);

    // Get user
    const user = await userService.getUserById(id);
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

    // Get user's effective permissions
    const permissions = await roleService.getUserEffectivePermissions(id);

    // Get role details
    const role = await roleService.getRoleByName(user.role);

    const result = {
      user_id: user.id,
      role: user.role,
      root_admin: user.root_admin,
      role_details: role,
      effective_permissions: permissions
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
 * PUT /api/users/:id/roles
 * Update user's role
 * Requires: users.manage_roles permission
 */
export async function updateUserRole(request: Request, env: CloudflareEnv, userId: string): Promise<Response> {
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

    // Authenticate and check permissions
    const authResult = await requirePermission('users.manage_roles')(request, env);
    if (!authResult.success) {
      return authResult.response;
    }

    const { context } = authResult;
    const userService = new UserService(env);
    const roleService = new RoleService(env);
    const activityService = new ActivityService(env);
    const permissionService = new PermissionService(env);

    // Get target user
    const user = await userService.getUserById(id);
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

    // Parse request body
    const body = await request.json();

    // Validate request data
    const validatedData = validateRequest(UserRoleUpdateSchema, body);

    // Check if user can assign the requested role
    if (!permissionService.canAssignRole(context.permissions!, validatedData.role)) {
      return new Response(
        JSON.stringify(errorResponse('Insufficient permissions to assign this role', 'FORBIDDEN')),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
            ...createCorsHeaders()
          }
        }
      );
    }

    // Users can't change their own role unless they're admin
    if (context.user!.id === id && !permissionService.canManageRoles(context.permissions!)) {
      return new Response(
        JSON.stringify(errorResponse('Cannot change your own role', 'FORBIDDEN')),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
            ...createCorsHeaders()
          }
        }
      );
    }

    // Store old role for logging
    const oldRole = user.role;

    // Update user role
    await roleService.updateUserRole(id, validatedData.role, validatedData.root_admin);

    // Get updated user
    const updatedUser = await userService.getUserById(id);
    if (!updatedUser) {
      throw new Error('Failed to retrieve updated user');
    }

    // Get updated permissions
    const permissions = await roleService.getUserEffectivePermissions(id);

    // Log activity
    await activityService.logRoleChanged(
      context.user!.id,
      id,
      oldRole,
      validatedData.role,
      request.headers.get('CF-Connecting-IP') || undefined,
      request.headers.get('User-Agent') || undefined
    );

    const result = {
      user_id: updatedUser.id,
      role: updatedUser.role,
      root_admin: updatedUser.root_admin,
      effective_permissions: permissions
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
    const status = errorResp.error?.message.includes('not found') ? 404 : 500;
    
    return new Response(
      JSON.stringify(errorResp),
      {
        status,
        headers: {
          'Content-Type': 'application/json',
          ...createCorsHeaders()
        }
      }
    );
  }
}

/**
 * GET /api/roles
 * Get all available roles
 * Requires: users.view permission
 */
export async function getRoles(request: Request, env: CloudflareEnv): Promise<Response> {
  try {
    // Authenticate and check permissions
    const authResult = await requirePermission('users.view')(request, env);
    if (!authResult.success) {
      return authResult.response;
    }

    const { context } = authResult;
    const roleService = new RoleService(env);
    const permissionService = new PermissionService(env);

    // Get all roles
    const roles = await roleService.getRoles();

    // Filter roles based on user's permissions
    const maxAssignableRole = permissionService.getMaxAssignableRole(context.permissions!);
    const roleHierarchy: { [key: string]: number } = {
      'user': 1,
      'moderator': 2,
      'admin': 3
    };

    const filteredRoles = roles.filter(role => 
      roleHierarchy[role.name] <= roleHierarchy[maxAssignableRole]
    );

    return new Response(
      JSON.stringify(successResponse(filteredRoles)),
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
 * POST /api/users/:id/suspend
 * Suspend user account
 * Requires: users.manage_roles permission
 */
export async function suspendUser(request: Request, env: CloudflareEnv, userId: string): Promise<Response> {
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

    // Authenticate and check permissions
    const authResult = await requirePermission('users.manage_roles')(request, env);
    if (!authResult.success) {
      return authResult.response;
    }

    const { context } = authResult;
    const userService = new UserService(env);
    const activityService = new ActivityService(env);

    // Check if user exists
    const user = await userService.getUserById(id);
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

    // Users can't suspend themselves
    if (context.user!.id === id) {
      return new Response(
        JSON.stringify(errorResponse('Cannot suspend your own account', 'FORBIDDEN')),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
            ...createCorsHeaders()
          }
        }
      );
    }

    // Suspend user
    await userService.suspendUser(id);

    // Log activity
    await activityService.logUserSuspended(
      context.user!.id,
      id,
      request.headers.get('CF-Connecting-IP') || undefined,
      request.headers.get('User-Agent') || undefined
    );

    return new Response(
      JSON.stringify(successResponse({ message: 'User suspended successfully' })),
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
 * POST /api/users/:id/activate
 * Activate user account
 * Requires: users.manage_roles permission
 */
export async function activateUser(request: Request, env: CloudflareEnv, userId: string): Promise<Response> {
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

    // Authenticate and check permissions
    const authResult = await requirePermission('users.manage_roles')(request, env);
    if (!authResult.success) {
      return authResult.response;
    }

    const { context } = authResult;
    const userService = new UserService(env);
    const activityService = new ActivityService(env);

    // Check if user exists
    const user = await userService.getUserById(id);
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

    // Activate user
    await userService.activateUser(id);

    // Log activity
    await activityService.logUserActivated(
      context.user!.id,
      id,
      request.headers.get('CF-Connecting-IP') || undefined,
      request.headers.get('User-Agent') || undefined
    );

    return new Response(
      JSON.stringify(successResponse({ message: 'User activated successfully' })),
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