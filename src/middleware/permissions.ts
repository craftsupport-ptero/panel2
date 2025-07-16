import jwt from 'jsonwebtoken';
import { JwtPayload, RequestContext, CloudflareEnv } from '@/types';
import { hasPermission, hasAnyPermission, hasAllPermissions } from '@/schemas/roles';
import { errorResponse, parseBearerToken } from '@/utils';

/**
 * Verify JWT token and extract user information
 */
export function verifyToken(token: string, secret: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    
    // Check if token is expired
    if (decoded.exp < Date.now() / 1000) {
      return null;
    }
    
    return decoded;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

/**
 * Authentication middleware
 * Extracts and verifies JWT token from Authorization header
 */
export async function authenticate(
  request: Request,
  env: CloudflareEnv
): Promise<{ success: true; context: RequestContext } | { success: false; response: Response }> {
  const authHeader = request.headers.get('Authorization');
  const token = parseBearerToken(authHeader);
  
  if (!token) {
    return {
      success: false,
      response: new Response(
        JSON.stringify(errorResponse('Authorization token required', 'UNAUTHORIZED')),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    };
  }
  
  const payload = verifyToken(token, env.JWT_SECRET);
  if (!payload) {
    return {
      success: false,
      response: new Response(
        JSON.stringify(errorResponse('Invalid or expired token', 'UNAUTHORIZED')),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    };
  }
  
  // Create request context
  const context: RequestContext = {
    user: {
      id: payload.user_id,
      username: payload.username,
      email: payload.email,
      role: payload.role,
      // These would be populated from database if needed
      email_verified_at: null,
      first_name: '',
      last_name: '',
      language: 'en',
      root_admin: payload.role === 'admin',
      use_totp: false,
      gravatar: false,
      avatar_url: null,
      created_at: '',
      updated_at: ''
    },
    permissions: payload.permissions,
    env
  };
  
  return { success: true, context };
}

/**
 * Permission checking middleware
 * Verifies user has required permissions for the action
 */
export function requirePermission(permission: string) {
  return async function(
    request: Request,
    env: CloudflareEnv,
    context?: RequestContext
  ): Promise<{ success: true; context: RequestContext } | { success: false; response: Response }> {
    
    // First authenticate if context not provided
    if (!context) {
      const authResult = await authenticate(request, env);
      if (!authResult.success) {
        return authResult;
      }
      context = authResult.context;
    }
    
    // Check permission
    if (!context.permissions || !hasPermission(context.permissions, permission)) {
      return {
        success: false,
        response: new Response(
          JSON.stringify(errorResponse('Insufficient permissions', 'FORBIDDEN')),
          {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      };
    }
    
    return { success: true, context };
  };
}

/**
 * Permission checking middleware for any of the specified permissions
 */
export function requireAnyPermission(permissions: string[]) {
  return async function(
    request: Request,
    env: CloudflareEnv,
    context?: RequestContext
  ): Promise<{ success: true; context: RequestContext } | { success: false; response: Response }> {
    
    // First authenticate if context not provided
    if (!context) {
      const authResult = await authenticate(request, env);
      if (!authResult.success) {
        return authResult;
      }
      context = authResult.context;
    }
    
    // Check permissions
    if (!context.permissions || !hasAnyPermission(context.permissions, permissions)) {
      return {
        success: false,
        response: new Response(
          JSON.stringify(errorResponse('Insufficient permissions', 'FORBIDDEN')),
          {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      };
    }
    
    return { success: true, context };
  };
}

/**
 * Permission checking middleware for all specified permissions
 */
export function requireAllPermissions(permissions: string[]) {
  return async function(
    request: Request,
    env: CloudflareEnv,
    context?: RequestContext
  ): Promise<{ success: true; context: RequestContext } | { success: false; response: Response }> {
    
    // First authenticate if context not provided
    if (!context) {
      const authResult = await authenticate(request, env);
      if (!authResult.success) {
        return authResult;
      }
      context = authResult.context;
    }
    
    // Check permissions
    if (!context.permissions || !hasAllPermissions(context.permissions, permissions)) {
      return {
        success: false,
        response: new Response(
          JSON.stringify(errorResponse('Insufficient permissions', 'FORBIDDEN')),
          {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      };
    }
    
    return { success: true, context };
  };
}

/**
 * Check if user can access own resources or has admin permissions
 */
export function requireOwnershipOrPermission(permission: string) {
  return async function(
    request: Request,
    env: CloudflareEnv,
    resourceUserId: number,
    context?: RequestContext
  ): Promise<{ success: true; context: RequestContext } | { success: false; response: Response }> {
    
    // First authenticate if context not provided
    if (!context) {
      const authResult = await authenticate(request, env);
      if (!authResult.success) {
        return authResult;
      }
      context = authResult.context;
    }
    
    // Check if user owns the resource or has the required permission
    const isOwner = context.user?.id === resourceUserId;
    const hasRequiredPermission = context.permissions && hasPermission(context.permissions, permission);
    
    if (!isOwner && !hasRequiredPermission) {
      return {
        success: false,
        response: new Response(
          JSON.stringify(errorResponse('Access denied', 'FORBIDDEN')),
          {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      };
    }
    
    return { success: true, context };
  };
}

/**
 * Check if user is admin
 */
export function requireAdmin() {
  return requirePermission('admin.view');
}

/**
 * Optional authentication - doesn't fail if no token provided
 */
export async function optionalAuthenticate(
  request: Request,
  env: CloudflareEnv
): Promise<RequestContext | null> {
  const authHeader = request.headers.get('Authorization');
  const token = parseBearerToken(authHeader);
  
  if (!token) {
    return null;
  }
  
  const payload = verifyToken(token, env.JWT_SECRET);
  if (!payload) {
    return null;
  }
  
  return {
    user: {
      id: payload.user_id,
      username: payload.username,
      email: payload.email,
      role: payload.role,
      email_verified_at: null,
      first_name: '',
      last_name: '',
      language: 'en',
      root_admin: payload.role === 'admin',
      use_totp: false,
      gravatar: false,
      avatar_url: null,
      created_at: '',
      updated_at: ''
    },
    permissions: payload.permissions,
    env
  };
}