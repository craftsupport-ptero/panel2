import { createMiddleware } from 'hono/factory';
import { verify } from 'hono/jwt';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { users } from '../db/schema';
import type { Env, JWTPayload, AuthenticatedContext } from '../types';

export const authMiddleware = createMiddleware<{
  Bindings: Env;
  Variables: AuthenticatedContext;
}>(async (c, next) => {
  const authorization = c.req.header('Authorization');
  
  if (!authorization) {
    return c.json({ 
      errors: [{ 
        code: 'Unauthorized', 
        status: '401', 
        detail: 'Authentication required' 
      }] 
    }, 401);
  }

  const [type, token] = authorization.split(' ');
  
  if (type !== 'Bearer' || !token) {
    return c.json({ 
      errors: [{ 
        code: 'Unauthorized', 
        status: '401', 
        detail: 'Invalid authorization format' 
      }] 
    }, 401);
  }

  try {
    const payload = await verify(token, c.env.JWT_SECRET) as JWTPayload;
    
    if (!payload.sub || !payload.uuid) {
      return c.json({ 
        errors: [{ 
          code: 'Unauthorized', 
          status: '401', 
          detail: 'Invalid token payload' 
        }] 
      }, 401);
    }

    // Get user from database to ensure they still exist
    const db = drizzle(c.env.DB);
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.uuid, payload.uuid))
      .limit(1);

    if (!user) {
      return c.json({ 
        errors: [{ 
          code: 'Unauthorized', 
          status: '401', 
          detail: 'User not found' 
        }] 
      }, 401);
    }

    // Set user context
    c.set('user', {
      id: user.id,
      uuid: user.uuid,
      username: user.username,
      email: user.email,
      rootAdmin: user.rootAdmin,
    });

    await next();
  } catch (error) {
    console.error('JWT verification failed:', error);
    return c.json({ 
      errors: [{ 
        code: 'Unauthorized', 
        status: '401', 
        detail: 'Invalid or expired token' 
      }] 
    }, 401);
  }
});

export const adminMiddleware = createMiddleware<{
  Bindings: Env;
  Variables: AuthenticatedContext;
}>(async (c, next) => {
  const user = c.get('user');
  
  if (!user?.rootAdmin) {
    return c.json({ 
      errors: [{ 
        code: 'Forbidden', 
        status: '403', 
        detail: 'Administrator access required' 
      }] 
    }, 403);
  }

  await next();
});

export const rateLimitMiddleware = createMiddleware<{
  Bindings: Env;
}>(async (c, next) => {
  const ip = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown';
  const limit = parseInt(c.env.API_RATE_LIMIT) || 100;
  const window = 60; // 1 minute window
  
  const key = `rate-limit:${ip}:${Math.floor(Date.now() / (window * 1000))}`;
  
  try {
    const current = await c.env.CACHE.get(key);
    const requests = current ? parseInt(current) : 0;
    
    if (requests >= limit) {
      return c.json({ 
        errors: [{ 
          code: 'TooManyRequests', 
          status: '429', 
          detail: 'Rate limit exceeded' 
        }] 
      }, 429);
    }
    
    await c.env.CACHE.put(key, (requests + 1).toString(), { expirationTtl: window });
    
    // Add rate limit headers
    c.header('X-RateLimit-Limit', limit.toString());
    c.header('X-RateLimit-Remaining', (limit - requests - 1).toString());
    c.header('X-RateLimit-Reset', (Math.floor(Date.now() / 1000) + window).toString());
    
    await next();
  } catch (error) {
    console.error('Rate limiting error:', error);
    // Continue on rate limiting error
    await next();
  }
});

export const corsMiddleware = createMiddleware<{
  Bindings: Env;
}>(async (c, next) => {
  const origin = c.req.header('Origin');
  const allowedOrigins = c.env.CORS_ORIGINS === '*' ? '*' : c.env.CORS_ORIGINS.split(',');
  
  if (allowedOrigins === '*' || (origin && allowedOrigins.includes(origin))) {
    c.header('Access-Control-Allow-Origin', origin || '*');
  }
  
  c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  c.header('Access-Control-Allow-Credentials', 'true');
  c.header('Access-Control-Max-Age', '86400');
  
  if (c.req.method === 'OPTIONS') {
    return c.text('', 204);
  }
  
  await next();
});