import { createErrorResponse } from '../utils/responses';
import type { Env, RequestContext, RateLimit } from '../types';

/**
 * Rate limiting middleware using Cloudflare KV storage
 */
export class RateLimitMiddleware {
  private env: Env;
  private readonly limitPrefix = 'rate_limit:';

  constructor(env: Env) {
    this.env = env;
  }

  /**
   * Apply rate limiting based on IP address
   */
  async limitByIP(
    request: Request,
    context: RequestContext,
    options: RateLimitOptions = {}
  ): Promise<Response | null> {
    const key = `ip:${context.ip}`;
    return this.applyRateLimit(key, options);
  }

  /**
   * Apply rate limiting based on user ID
   */
  async limitByUser(
    request: Request,
    context: RequestContext,
    options: RateLimitOptions = {}
  ): Promise<Response | null> {
    if (!context.user) {
      // Fall back to IP-based limiting if no user
      return this.limitByIP(request, context, options);
    }

    const key = `user:${context.user.id}`;
    return this.applyRateLimit(key, options);
  }

  /**
   * Apply rate limiting based on API key
   */
  async limitByApiKey(
    request: Request,
    context: RequestContext,
    options: RateLimitOptions = {}
  ): Promise<Response | null> {
    if (!context.apiKey) {
      // Fall back to user/IP limiting if no API key
      return context.user 
        ? this.limitByUser(request, context, options)
        : this.limitByIP(request, context, options);
    }

    const key = `api_key:${context.apiKey.id}`;
    return this.applyRateLimit(key, options);
  }

  /**
   * Create endpoint-specific rate limiters
   */
  createEndpointLimiter(endpoint: string, options: RateLimitOptions) {
    return async (request: Request, context: RequestContext): Promise<Response | null> => {
      const key = `endpoint:${endpoint}:${context.ip}`;
      return this.applyRateLimit(key, options);
    };
  }

  /**
   * Core rate limiting logic using sliding window algorithm
   */
  private async applyRateLimit(
    key: string,
    options: RateLimitOptions
  ): Promise<Response | null> {
    const limit = options.limit || parseInt(this.env.RATE_LIMIT_REQUESTS, 10);
    const windowMs = (options.windowMs || parseInt(this.env.RATE_LIMIT_WINDOW, 10)) * 1000;
    const now = Date.now();
    const windowStart = now - windowMs;

    const fullKey = this.limitPrefix + key;
    
    try {
      // Get current rate limit data
      const existingData = await this.env.RATE_LIMITS.get(fullKey);
      let rateLimit: RateLimit;

      if (existingData) {
        const data = JSON.parse(existingData);
        rateLimit = {
          count: data.count || 0,
          resetTime: data.resetTime || now + windowMs,
          limit,
          remaining: Math.max(0, limit - (data.count || 0))
        };

        // Check if we're in a new window
        if (now >= data.resetTime) {
          rateLimit = {
            count: 1,
            resetTime: now + windowMs,
            limit,
            remaining: limit - 1
          };
        } else {
          // Increment count in current window
          rateLimit.count++;
          rateLimit.remaining = Math.max(0, limit - rateLimit.count);
        }
      } else {
        // First request
        rateLimit = {
          count: 1,
          resetTime: now + windowMs,
          limit,
          remaining: limit - 1
        };
      }

      // Store updated rate limit data
      const ttl = Math.ceil((rateLimit.resetTime - now) / 1000);
      await this.env.RATE_LIMITS.put(
        fullKey,
        JSON.stringify({
          count: rateLimit.count,
          resetTime: rateLimit.resetTime
        }),
        { expirationTtl: ttl }
      );

      // Check if limit exceeded
      if (rateLimit.count > limit) {
        const retryAfter = Math.ceil((rateLimit.resetTime - now) / 1000);
        
        const response = createErrorResponse(
          options.message || 'Rate limit exceeded',
          429,
          'RATE_LIMIT_EXCEEDED',
          {
            rateLimit: {
              limit,
              remaining: 0,
              resetTime: rateLimit.resetTime,
              retryAfter
            }
          }
        );

        // Add rate limit headers
        response.headers.set('X-RateLimit-Limit', limit.toString());
        response.headers.set('X-RateLimit-Remaining', '0');
        response.headers.set('X-RateLimit-Reset', rateLimit.resetTime.toString());
        response.headers.set('Retry-After', retryAfter.toString());

        return response;
      }

      // Add rate limit info to context for response headers
      if (!options.skipHeaders) {
        context.rateLimit = rateLimit;
      }

      return null; // Continue to next middleware
    } catch (error) {
      console.error('Rate limiting error:', error);
      // In case of error, allow the request to proceed
      return null;
    }
  }

  /**
   * Add rate limit headers to response
   */
  addRateLimitHeaders(response: Response, rateLimit: RateLimit): Response {
    const newHeaders = new Headers(response.headers);
    
    newHeaders.set('X-RateLimit-Limit', rateLimit.limit.toString());
    newHeaders.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
    newHeaders.set('X-RateLimit-Reset', rateLimit.resetTime.toString());

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders
    });
  }
}

/**
 * Rate limit configuration options
 */
export interface RateLimitOptions {
  limit?: number;          // Number of requests allowed
  windowMs?: number;       // Time window in seconds
  message?: string;        // Custom error message
  skipHeaders?: boolean;   // Skip adding rate limit headers
}

/**
 * Predefined rate limit configurations
 */
export const RATE_LIMITS = {
  // Authentication endpoints - stricter limits
  AUTH: {
    limit: 5,
    windowMs: 60, // 1 minute
    message: 'Too many authentication attempts'
  },
  
  // API endpoints - moderate limits
  API: {
    limit: 100,
    windowMs: 900, // 15 minutes
    message: 'API rate limit exceeded'
  },
  
  // Public endpoints - loose limits
  PUBLIC: {
    limit: 1000,
    windowMs: 3600, // 1 hour
    message: 'Rate limit exceeded'
  },
  
  // Admin endpoints - moderate but higher limits
  ADMIN: {
    limit: 200,
    windowMs: 900, // 15 minutes
    message: 'Admin API rate limit exceeded'
  },
  
  // File operations - stricter limits
  FILES: {
    limit: 50,
    windowMs: 300, // 5 minutes
    message: 'File operation rate limit exceeded'
  }
} as const;

/**
 * Middleware factory functions
 */
export function createRateLimitMiddleware(env: Env) {
  const rateLimitMiddleware = new RateLimitMiddleware(env);
  
  return {
    limitByIP: rateLimitMiddleware.limitByIP.bind(rateLimitMiddleware),
    limitByUser: rateLimitMiddleware.limitByUser.bind(rateLimitMiddleware),
    limitByApiKey: rateLimitMiddleware.limitByApiKey.bind(rateLimitMiddleware),
    createEndpointLimiter: rateLimitMiddleware.createEndpointLimiter.bind(rateLimitMiddleware),
    addHeaders: rateLimitMiddleware.addRateLimitHeaders.bind(rateLimitMiddleware)
  };
}