import { JWTService, extractBearerToken } from '../auth/jwt';
import { SessionService } from '../auth/sessions';
import { ApiKeyService } from '../auth/api-keys';
import { createErrorResponse } from '../utils/responses';
import type { Env, RequestContext, User } from '../types';

/**
 * Authentication middleware for protecting routes
 */
export class AuthMiddleware {
  private jwtService: JWTService;
  private sessionService: SessionService;
  private apiKeyService: ApiKeyService;

  constructor(private env: Env) {
    this.jwtService = new JWTService(env);
    this.sessionService = new SessionService(env);
    this.apiKeyService = new ApiKeyService(env);
  }

  /**
   * Middleware for routes that require any authentication
   */
  async requireAuth(request: Request, context: RequestContext): Promise<Response | null> {
    const result = await this.authenticateRequest(request, context);
    
    if (!result.authenticated) {
      return createErrorResponse(
        result.error || 'Authentication required',
        401,
        'AUTHENTICATION_REQUIRED'
      );
    }
    
    return null; // Continue to next middleware/handler
  }

  /**
   * Middleware for routes that require admin authentication
   */
  async requireAdmin(request: Request, context: RequestContext): Promise<Response | null> {
    const result = await this.authenticateRequest(request, context);
    
    if (!result.authenticated) {
      return createErrorResponse(
        result.error || 'Authentication required',
        401,
        'AUTHENTICATION_REQUIRED'
      );
    }

    if (!result.user?.root_admin) {
      return createErrorResponse(
        'Admin access required',
        403,
        'INSUFFICIENT_PERMISSIONS'
      );
    }
    
    return null; // Continue to next middleware/handler
  }

  /**
   * Middleware for routes that require specific API permissions
   */
  requirePermission(permission: string) {
    return async (request: Request, context: RequestContext): Promise<Response | null> => {
      const result = await this.authenticateRequest(request, context);
      
      if (!result.authenticated) {
        return createErrorResponse(
          result.error || 'Authentication required',
          401,
          'AUTHENTICATION_REQUIRED'
        );
      }

      // Admin users have all permissions
      if (result.user?.root_admin) {
        return null;
      }

      // Check API key permissions if present
      if (context.apiKey) {
        if (!this.apiKeyService.hasPermission(context.apiKey, permission)) {
          return createErrorResponse(
            `Permission '${permission}' required`,
            403,
            'INSUFFICIENT_PERMISSIONS'
          );
        }
      }
      
      return null;
    };
  }

  /**
   * Optional authentication - sets user context if authenticated but doesn't require it
   */
  async optionalAuth(request: Request, context: RequestContext): Promise<Response | null> {
    await this.authenticateRequest(request, context);
    return null; // Always continue, regardless of authentication status
  }

  /**
   * Core authentication logic
   */
  private async authenticateRequest(request: Request, context: RequestContext): Promise<{
    authenticated: boolean;
    user?: User;
    error?: string;
  }> {
    // Try JWT authentication first
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      const token = extractBearerToken(authHeader);
      if (token) {
        return this.authenticateJWT(token, context);
      }
    }

    // Try API key authentication
    const apiKey = request.headers.get('x-api-key') || 
                   request.headers.get('api-key') ||
                   new URL(request.url).searchParams.get('api_key');
    
    if (apiKey) {
      return this.authenticateApiKey(apiKey, context);
    }

    return { authenticated: false, error: 'No authentication provided' };
  }

  /**
   * Authenticate using JWT token
   */
  private async authenticateJWT(token: string, context: RequestContext): Promise<{
    authenticated: boolean;
    user?: User;
    error?: string;
  }> {
    try {
      const payload = await this.jwtService.verifyToken(token);
      
      // Get user from database
      const user = await this.getUserById(payload.sub);
      if (!user) {
        return { authenticated: false, error: 'User not found' };
      }

      // Check if token is access token (not refresh token)
      if (payload.type !== 'access') {
        return { authenticated: false, error: 'Invalid token type' };
      }

      // Update context
      context.user = user;

      // Create or update session
      const sessionId = this.extractSessionId(token);
      if (sessionId) {
        await this.sessionService.updateSessionActivity(sessionId);
        context.session = await this.sessionService.getSession(sessionId);
      }

      return { authenticated: true, user };
    } catch (error) {
      return { authenticated: false, error: 'Invalid or expired token' };
    }
  }

  /**
   * Authenticate using API key
   */
  private async authenticateApiKey(apiKey: string, context: RequestContext): Promise<{
    authenticated: boolean;
    user?: User;
    error?: string;
  }> {
    const result = await this.apiKeyService.validateApiKey(apiKey, context.ip);
    
    if (!result.valid) {
      return { authenticated: false, error: result.error };
    }

    // Update context
    context.user = result.user;
    context.apiKey = result.apiKey;

    return { authenticated: true, user: result.user };
  }

  /**
   * Get user by ID from database
   */
  private async getUserById(userId: number): Promise<User | null> {
    try {
      const stmt = this.env.DB.prepare(`
        SELECT id, username, email, root_admin, created_at, updated_at 
        FROM users 
        WHERE id = ?
      `);
      
      const result = await stmt.bind(userId).first();
      
      if (!result) {
        return null;
      }

      return {
        id: result.id as number,
        username: result.username as string,
        email: result.email as string,
        root_admin: Boolean(result.root_admin),
        created_at: result.created_at as string,
        updated_at: result.updated_at as string
      };
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  /**
   * Extract session ID from JWT token (this is a simplified approach)
   */
  private extractSessionId(token: string): string | null {
    // In a real implementation, you might include session ID in the JWT
    // or maintain a separate mapping
    return null;
  }
}

/**
 * Middleware factory functions for easy use
 */
export function createAuthMiddleware(env: Env) {
  const authMiddleware = new AuthMiddleware(env);
  
  return {
    requireAuth: authMiddleware.requireAuth.bind(authMiddleware),
    requireAdmin: authMiddleware.requireAdmin.bind(authMiddleware),
    requirePermission: authMiddleware.requirePermission.bind(authMiddleware),
    optionalAuth: authMiddleware.optionalAuth.bind(authMiddleware)
  };
}