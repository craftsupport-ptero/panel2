import { CloudflareEnv } from '@/types';
import { createCorsHeaders, errorResponse } from '@/utils';

// Import user management routes
import {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserStats
} from '@/routes/users/index';

import {
  getProfile,
  updateProfile,
  changePassword,
  uploadAvatar,
  getSettings,
  updateSettings,
  getActivity
} from '@/routes/users/profile';

import {
  getUserRoles,
  updateUserRole,
  getRoles,
  suspendUser,
  activateUser
} from '@/routes/users/roles';

import {
  getUserPermissions,
  getPermissions,
  checkPermissions,
  getPermissionsByResource,
  getPermissionStats,
  getUserActivity
} from '@/routes/users/permissions';

/**
 * Main router for the Pterodactyl Panel API
 */
export async function handleRequest(request: Request, env: CloudflareEnv): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  // Handle CORS preflight requests
  if (method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: createCorsHeaders(request.headers.get('Origin') || undefined)
    });
  }

  try {
    // User Management Routes
    if (path === '/api/users') {
      switch (method) {
        case 'GET':
          return await listUsers(request, env);
        case 'POST':
          return await createUser(request, env);
        default:
          return methodNotAllowed();
      }
    }

    // User Statistics
    if (path === '/api/users/stats' && method === 'GET') {
      return await getUserStats(request, env);
    }

    // Profile Management Routes
    if (path === '/api/users/profile') {
      switch (method) {
        case 'GET':
          return await getProfile(request, env);
        case 'PUT':
          return await updateProfile(request, env);
        default:
          return methodNotAllowed();
      }
    }

    if (path === '/api/users/profile/password' && method === 'PUT') {
      return await changePassword(request, env);
    }

    if (path === '/api/users/profile/avatar' && method === 'POST') {
      return await uploadAvatar(request, env);
    }

    if (path === '/api/users/profile/settings') {
      switch (method) {
        case 'GET':
          return await getSettings(request, env);
        case 'PUT':
          return await updateSettings(request, env);
        default:
          return methodNotAllowed();
      }
    }

    if (path === '/api/users/profile/activity' && method === 'GET') {
      return await getActivity(request, env);
    }

    // Role Management Routes
    if (path === '/api/roles' && method === 'GET') {
      return await getRoles(request, env);
    }

    // Permission Management Routes
    if (path === '/api/permissions') {
      switch (method) {
        case 'GET':
          return await getPermissions(request, env);
        default:
          return methodNotAllowed();
      }
    }

    if (path === '/api/permissions/check' && method === 'POST') {
      return await checkPermissions(request, env);
    }

    if (path === '/api/permissions/resources' && method === 'GET') {
      return await getPermissionsByResource(request, env);
    }

    if (path === '/api/permissions/stats' && method === 'GET') {
      return await getPermissionStats(request, env);
    }

    // Dynamic User Routes (with ID parameter)
    const userIdMatch = path.match(/^\/api\/users\/(\d+)$/);
    if (userIdMatch) {
      const userId = userIdMatch[1];
      switch (method) {
        case 'GET':
          return await getUserById(request, env, userId);
        case 'PUT':
          return await updateUser(request, env, userId);
        case 'DELETE':
          return await deleteUser(request, env, userId);
        default:
          return methodNotAllowed();
      }
    }

    // User Role Management Routes
    const userRoleMatch = path.match(/^\/api\/users\/(\d+)\/roles$/);
    if (userRoleMatch) {
      const userId = userRoleMatch[1];
      switch (method) {
        case 'GET':
          return await getUserRoles(request, env, userId);
        case 'PUT':
          return await updateUserRole(request, env, userId);
        default:
          return methodNotAllowed();
      }
    }

    // User Permission Routes
    const userPermissionMatch = path.match(/^\/api\/users\/(\d+)\/permissions$/);
    if (userPermissionMatch) {
      const userId = userPermissionMatch[1];
      switch (method) {
        case 'GET':
          return await getUserPermissions(request, env, userId);
        default:
          return methodNotAllowed();
      }
    }

    // User Activity Routes
    const userActivityMatch = path.match(/^\/api\/users\/(\d+)\/activity$/);
    if (userActivityMatch) {
      const userId = userActivityMatch[1];
      switch (method) {
        case 'GET':
          return await getUserActivity(request, env, userId);
        default:
          return methodNotAllowed();
      }
    }

    // User Suspend/Activate Routes
    const userSuspendMatch = path.match(/^\/api\/users\/(\d+)\/suspend$/);
    if (userSuspendMatch && method === 'POST') {
      const userId = userSuspendMatch[1];
      return await suspendUser(request, env, userId);
    }

    const userActivateMatch = path.match(/^\/api\/users\/(\d+)\/activate$/);
    if (userActivateMatch && method === 'POST') {
      const userId = userActivateMatch[1];
      return await activateUser(request, env, userId);
    }

    // Health Check
    if (path === '/api/health' && method === 'GET') {
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            environment: env.ENVIRONMENT
          }
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...createCorsHeaders()
          }
        }
      );
    }

    // Route not found
    return notFound();

  } catch (error) {
    console.error('Unhandled error in router:', error);
    return new Response(
      JSON.stringify(errorResponse('Internal server error', 'INTERNAL_ERROR')),
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
 * Handle method not allowed
 */
function methodNotAllowed(): Response {
  return new Response(
    JSON.stringify(errorResponse('Method not allowed', 'METHOD_NOT_ALLOWED')),
    {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        ...createCorsHeaders()
      }
    }
  );
}

/**
 * Handle route not found
 */
function notFound(): Response {
  return new Response(
    JSON.stringify(errorResponse('Route not found', 'NOT_FOUND')),
    {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
        ...createCorsHeaders()
      }
    }
  );
}

/**
 * Cloudflare Workers fetch handler
 */
export default {
  async fetch(request: Request, env: CloudflareEnv): Promise<Response> {
    return await handleRequest(request, env);
  }
};