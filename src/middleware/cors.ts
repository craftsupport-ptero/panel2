import { Context, Next } from 'hono';
import { cors } from 'hono/cors';

export function createCorsMiddleware() {
  return cors({
    origin: (origin, c) => {
      // Allow all origins in development
      if (c.env.ENVIRONMENT === 'development') {
        return origin || '*';
      }
      
      // In production, check against allowed origins
      const allowedOrigins = [
        'https://pterodactyl.io',
        'https://panel.pterodactyl.io',
        // Add your domain here
      ];
      
      if (!origin) return '*';
      
      return allowedOrigins.includes(origin) ? origin : null;
    },
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'Cache-Control',
      'X-File-Name'
    ],
    exposeHeaders: [
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset'
    ],
    credentials: true,
    maxAge: 86400, // 24 hours
  });
}