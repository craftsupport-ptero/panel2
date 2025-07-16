import { CloudflareEnv, UserCreateRequest, UserUpdateRequest, PaginationParams } from '@/types';
import { UserService } from '@/services/userService';
import { ActivityService } from '@/services/activityService';
import { PermissionService } from '@/services/permissionService';
import { UserCreateSchema, UserUpdateSchema, UserQuerySchema, validateRequest } from '@/schemas/users';
import { authenticate, requirePermission, requireOwnershipOrPermission } from '@/middleware/permissions';
import { 
  successResponse, 
  errorResponse, 
  handleError, 
  extractPaginationParams, 
  createCorsHeaders 
} from '@/utils';

/**
 * GET /api/users
 * List users with pagination and filtering
 * Requires: users.view permission
 */
export async function listUsers(request: Request, env: CloudflareEnv): Promise<Response> {
  try {
    // Authenticate and check permissions
    const authResult = await requirePermission('users.view')(request, env);
    if (!authResult.success) {
      return authResult.response;
    }

    const { context } = authResult;
    const userService = new UserService(env);
    const activityService = new ActivityService(env);

    // Extract and validate query parameters
    const url = new URL(request.url);
    const queryParams = extractPaginationParams(url.searchParams);
    
    // Add role filter if provided
    const role = url.searchParams.get('role');
    if (role && ['admin', 'moderator', 'user'].includes(role)) {
      queryParams.role = role as 'admin' | 'moderator' | 'user';
    }

    // Validate query parameters
    const validatedParams = validateRequest(UserQuerySchema, {
      page: queryParams.page.toString(),
      limit: queryParams.limit.toString(),
      search: queryParams.search,
      role: queryParams.role,
      sort: queryParams.sort,
      order: queryParams.order
    });

    // Get users
    const result = await userService.getUsers(validatedParams);

    // Log activity
    await activityService.logActivity(
      context.user!.id,
      'users.list',
      `Listed users (page ${validatedParams.page}, limit ${validatedParams.limit})`,
      request.headers.get('CF-Connecting-IP') || undefined,
      request.headers.get('User-Agent') || undefined
    );

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
 * GET /api/users/:id
 * Get user by ID
 * Requires: users.view permission or own user
 */
export async function getUserById(request: Request, env: CloudflareEnv, userId: string): Promise<Response> {
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

    const { context } = authResult;
    const userService = new UserService(env);
    const activityService = new ActivityService(env);

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

    // Log activity (only if viewing another user)
    if (context.user!.id !== id) {
      await activityService.logActivity(
        context.user!.id,
        'users.view',
        `Viewed user: ${user.username} (ID: ${id})`,
        request.headers.get('CF-Connecting-IP') || undefined,
        request.headers.get('User-Agent') || undefined
      );
    }

    return new Response(
      JSON.stringify(successResponse(user)),
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
 * POST /api/users
 * Create new user
 * Requires: users.create permission
 */
export async function createUser(request: Request, env: CloudflareEnv): Promise<Response> {
  try {
    // Authenticate and check permissions
    const authResult = await requirePermission('users.create')(request, env);
    if (!authResult.success) {
      return authResult.response;
    }

    const { context } = authResult;
    const userService = new UserService(env);
    const activityService = new ActivityService(env);
    const permissionService = new PermissionService(env);

    // Parse request body
    const body = await request.json() as UserCreateRequest;

    // Validate request data
    const validatedData = validateRequest(UserCreateSchema, body);

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

    // Create user
    const user = await userService.createUser(validatedData);

    // Log activity
    await activityService.logUserCreated(
      context.user!.id,
      user.id,
      request.headers.get('CF-Connecting-IP') || undefined,
      request.headers.get('User-Agent') || undefined
    );

    return new Response(
      JSON.stringify(successResponse(user)),
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
          ...createCorsHeaders()
        }
      }
    );
  } catch (error) {
    const errorResp = handleError(error);
    const status = errorResp.error?.message.includes('already exists') ? 409 : 500;
    
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
 * PUT /api/users/:id
 * Update user
 * Requires: users.edit permission or own user
 */
export async function updateUser(request: Request, env: CloudflareEnv, userId: string): Promise<Response> {
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
    const authResult = await requireOwnershipOrPermission('users.edit')(request, env, id);
    if (!authResult.success) {
      return authResult.response;
    }

    const { context } = authResult;
    const userService = new UserService(env);
    const activityService = new ActivityService(env);
    const permissionService = new PermissionService(env);

    // Parse request body
    const body = await request.json() as UserUpdateRequest;

    // Validate request data
    const validatedData = validateRequest(UserUpdateSchema, body);

    // If role is being changed, check permissions
    if (validatedData.role && !permissionService.canAssignRole(context.permissions!, validatedData.role)) {
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

    // Users can't change their own role or admin status unless they're admin
    const isOwnProfile = context.user!.id === id;
    if (isOwnProfile && (validatedData.role || validatedData.root_admin !== undefined)) {
      if (!permissionService.canManageRoles(context.permissions!)) {
        return new Response(
          JSON.stringify(errorResponse('Cannot change your own role or admin status', 'FORBIDDEN')),
          {
            status: 403,
            headers: {
              'Content-Type': 'application/json',
              ...createCorsHeaders()
            }
          }
        );
      }
    }

    // Track changes for activity log
    const changes: string[] = [];
    if (validatedData.username) changes.push('username');
    if (validatedData.email) changes.push('email');
    if (validatedData.first_name) changes.push('first_name');
    if (validatedData.last_name) changes.push('last_name');
    if (validatedData.language) changes.push('language');
    if (validatedData.role) changes.push('role');
    if (validatedData.root_admin !== undefined) changes.push('root_admin');

    // Update user
    const user = await userService.updateUser(id, validatedData);

    // Log activity
    if (isOwnProfile) {
      await activityService.logProfileUpdate(
        context.user!.id,
        changes,
        request.headers.get('CF-Connecting-IP') || undefined,
        request.headers.get('User-Agent') || undefined
      );
    } else {
      await activityService.logUserUpdated(
        context.user!.id,
        id,
        changes,
        request.headers.get('CF-Connecting-IP') || undefined,
        request.headers.get('User-Agent') || undefined
      );
    }

    return new Response(
      JSON.stringify(successResponse(user)),
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
    const status = errorResp.error?.message.includes('not found') ? 404 :
                   errorResp.error?.message.includes('already exists') ? 409 : 500;
    
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
 * DELETE /api/users/:id
 * Delete user
 * Requires: users.delete permission
 */
export async function deleteUser(request: Request, env: CloudflareEnv, userId: string): Promise<Response> {
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
    const authResult = await requirePermission('users.delete')(request, env);
    if (!authResult.success) {
      return authResult.response;
    }

    const { context } = authResult;
    const userService = new UserService(env);
    const activityService = new ActivityService(env);

    // Users can't delete themselves
    if (context.user!.id === id) {
      return new Response(
        JSON.stringify(errorResponse('Cannot delete your own account', 'FORBIDDEN')),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
            ...createCorsHeaders()
          }
        }
      );
    }

    // Get user info before deletion for logging
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

    // Delete user
    await userService.deleteUser(id);

    // Log activity
    await activityService.logUserDeleted(
      context.user!.id,
      id,
      request.headers.get('CF-Connecting-IP') || undefined,
      request.headers.get('User-Agent') || undefined
    );

    return new Response(
      JSON.stringify(successResponse({ message: 'User deleted successfully' })),
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
 * GET /api/users/stats
 * Get user statistics
 * Requires: admin.users permission
 */
export async function getUserStats(request: Request, env: CloudflareEnv): Promise<Response> {
  try {
    // Authenticate and check permissions
    const authResult = await requirePermission('admin.users')(request, env);
    if (!authResult.success) {
      return authResult.response;
    }

    const userService = new UserService(env);
    const stats = await userService.getUserStats();

    return new Response(
      JSON.stringify(successResponse(stats)),
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