import { createAuthMiddleware } from './middleware/auth';
import { createRateLimitMiddleware, RATE_LIMITS } from './middleware/rateLimit';
import { createCorsMiddleware } from './middleware/cors';
import { ErrorHandlerMiddleware } from './middleware/errorHandler';
import { AuthRoutes } from './routes/auth';
import { createErrorResponse } from './utils/responses';
import type { Env, RequestContext } from './types';

/**
 * Main Cloudflare Worker entry point
 */
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Initialize request context
    const context: RequestContext = {
      ip: request.headers.get('cf-connecting-ip') || 
          request.headers.get('x-forwarded-for') || 
          'unknown',
      userAgent: request.headers.get('user-agent') || undefined,
      env
    };

    try {
      return await handleRequest(request, context, env);
    } catch (error) {
      console.error('Worker error:', error);
      return ErrorHandlerMiddleware.handleError(error as Error, request, context);
    }
  }
};

/**
 * Main request handler with middleware chain
 */
async function handleRequest(request: Request, context: RequestContext, env: Env): Promise<Response> {
  const url = new URL(request.url);
  
  // Initialize middleware
  const authMiddleware = createAuthMiddleware(env);
  const rateLimitMiddleware = createRateLimitMiddleware(env);
  const corsMiddleware = createCorsMiddleware(env.ENVIRONMENT);
  
  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return corsMiddleware.handle(request, context) || new Response(null, { status: 204 });
  }

  // Create router
  const router = new Router();
  
  // Initialize route handlers
  const authRoutes = new AuthRoutes(env);

  // Authentication routes
  router.post('/api/auth/login', [
    rateLimitMiddleware.createEndpointLimiter('auth_login', RATE_LIMITS.AUTH),
    ErrorHandlerMiddleware.wrapHandler(authRoutes.login.bind(authRoutes))
  ]);

  router.post('/api/auth/register', [
    rateLimitMiddleware.createEndpointLimiter('auth_register', RATE_LIMITS.AUTH),
    ErrorHandlerMiddleware.wrapHandler(authRoutes.register.bind(authRoutes))
  ]);

  router.post('/api/auth/logout', [
    authMiddleware.requireAuth,
    ErrorHandlerMiddleware.wrapHandler(authRoutes.logout.bind(authRoutes))
  ]);

  router.post('/api/auth/logout-all', [
    authMiddleware.requireAuth,
    ErrorHandlerMiddleware.wrapHandler(authRoutes.logoutAll.bind(authRoutes))
  ]);

  router.post('/api/auth/refresh', [
    rateLimitMiddleware.createEndpointLimiter('auth_refresh', RATE_LIMITS.AUTH),
    ErrorHandlerMiddleware.wrapHandler(authRoutes.refresh.bind(authRoutes))
  ]);

  router.get('/api/auth/me', [
    authMiddleware.requireAuth,
    rateLimitMiddleware.limitByUser,
    ErrorHandlerMiddleware.wrapHandler(authRoutes.me.bind(authRoutes))
  ]);

  router.post('/api/auth/change-password', [
    authMiddleware.requireAuth,
    rateLimitMiddleware.createEndpointLimiter('change_password', RATE_LIMITS.AUTH),
    ErrorHandlerMiddleware.wrapHandler(authRoutes.changePassword.bind(authRoutes))
  ]);

  router.post('/api/auth/reset-password', [
    rateLimitMiddleware.createEndpointLimiter('reset_password', RATE_LIMITS.AUTH),
    ErrorHandlerMiddleware.wrapHandler(authRoutes.requestPasswordReset.bind(authRoutes))
  ]);

  router.post('/api/auth/reset-password/confirm', [
    rateLimitMiddleware.createEndpointLimiter('reset_password_confirm', RATE_LIMITS.AUTH),
    ErrorHandlerMiddleware.wrapHandler(authRoutes.resetPassword.bind(authRoutes))
  ]);

  // Health check endpoint
  router.get('/health', [
    async (request: Request, context: RequestContext) => {
      return new Response(JSON.stringify({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
  ]);

  // Handle the request
  const response = await router.handle(request, context);
  
  // Add CORS headers to response
  const corsResponse = corsMiddleware.addCorsHeaders(response, request.headers.get('origin'));
  
  // Add rate limit headers if available
  if (context.rateLimit) {
    return rateLimitMiddleware.addHeaders(corsResponse, context.rateLimit);
  }
  
  return corsResponse;
}

/**
 * Simple router implementation
 */
class Router {
  private routes: RouteDefinition[] = [];

  get(path: string, handlers: MiddlewareHandler[]): void {
    this.routes.push({ method: 'GET', path, handlers });
  }

  post(path: string, handlers: MiddlewareHandler[]): void {
    this.routes.push({ method: 'POST', path, handlers });
  }

  put(path: string, handlers: MiddlewareHandler[]): void {
    this.routes.push({ method: 'PUT', path, handlers });
  }

  delete(path: string, handlers: MiddlewareHandler[]): void {
    this.routes.push({ method: 'DELETE', path, handlers });
  }

  patch(path: string, handlers: MiddlewareHandler[]): void {
    this.routes.push({ method: 'PATCH', path, handlers });
  }

  async handle(request: Request, context: RequestContext): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method;
    const path = url.pathname;

    // Find matching route
    for (const route of this.routes) {
      if (route.method === method && this.matchPath(route.path, path)) {
        // Extract path parameters
        const params = this.extractParams(route.path, path);
        context.params = params;

        // Execute middleware chain
        for (const handler of route.handlers) {
          const result = await handler(request, context);
          if (result) {
            return result; // Handler returned a response
          }
        }
        
        // If we get here, no handler returned a response
        return ErrorHandlerMiddleware.internalServerError('No response generated');
      }
    }

    // No route found
    return ErrorHandlerMiddleware.notFound('Endpoint not found');
  }

  private matchPath(routePath: string, requestPath: string): boolean {
    // Simple path matching with parameter support
    const routeParts = routePath.split('/');
    const requestParts = requestPath.split('/');

    if (routeParts.length !== requestParts.length) {
      return false;
    }

    for (let i = 0; i < routeParts.length; i++) {
      const routePart = routeParts[i];
      const requestPart = requestParts[i];

      if (routePart.startsWith(':')) {
        // Parameter - matches any value
        continue;
      }

      if (routePart !== requestPart) {
        return false;
      }
    }

    return true;
  }

  private extractParams(routePath: string, requestPath: string): Record<string, string> {
    const params: Record<string, string> = {};
    const routeParts = routePath.split('/');
    const requestParts = requestPath.split('/');

    for (let i = 0; i < routeParts.length; i++) {
      const routePart = routeParts[i];
      const requestPart = requestParts[i];

      if (routePart.startsWith(':')) {
        const paramName = routePart.substring(1);
        params[paramName] = requestPart;
      }
    }

    return params;
  }
}

/**
 * Type definitions
 */
interface RouteDefinition {
  method: string;
  path: string;
  handlers: MiddlewareHandler[];
}

type MiddlewareHandler = (request: Request, context: RequestContext) => Promise<Response | null>;

// Extend RequestContext for route parameters
declare module './types' {
  interface RequestContext {
    rateLimit?: import('./types').RateLimit;
    env?: Env;
  }
}