import { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { Env } from './auth';

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export function createRateLimiter(options: RateLimitOptions) {
  return async function rateLimitMiddleware(c: Context<{ Bindings: Env }>, next: Next) {
    const ip = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown';
    const key = `rate_limit:${ip}`;
    const now = Date.now();
    const windowStart = now - options.windowMs;

    try {
      // Get current request count from KV
      const currentData = await c.env.CACHE.get(key);
      const requests = currentData ? JSON.parse(currentData) : [];

      // Filter out old requests outside the window
      const validRequests = requests.filter((timestamp: number) => timestamp > windowStart);

      // Check if limit exceeded
      if (validRequests.length >= options.maxRequests) {
        const oldestRequest = Math.min(...validRequests);
        const resetTime = oldestRequest + options.windowMs;
        
        c.header('X-RateLimit-Limit', options.maxRequests.toString());
        c.header('X-RateLimit-Remaining', '0');
        c.header('X-RateLimit-Reset', Math.ceil(resetTime / 1000).toString());
        
        throw new HTTPException(429, { 
          message: options.message || 'Too many requests. Please try again later.'
        });
      }

      // Add current request timestamp
      validRequests.push(now);

      // Store updated requests list
      await c.env.CACHE.put(key, JSON.stringify(validRequests), {
        expirationTtl: Math.ceil(options.windowMs / 1000)
      });

      // Set rate limit headers
      c.header('X-RateLimit-Limit', options.maxRequests.toString());
      c.header('X-RateLimit-Remaining', (options.maxRequests - validRequests.length).toString());
      
      await next();
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      
      console.error('Rate limit middleware error:', error);
      // If rate limiting fails, allow the request to continue
      await next();
    }
  };
}

// Pre-configured rate limiters
export const apiRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per 15 minutes
  message: 'Too many API requests from this IP, please try again later.'
});

export const authRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 login attempts per 15 minutes
  message: 'Too many authentication attempts, please try again later.'
});

export const strictRateLimit = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 requests per minute
  message: 'Rate limit exceeded. Please slow down.'
});