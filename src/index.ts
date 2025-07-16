import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { createCorsMiddleware } from './middleware/cors';
import { authMiddleware, adminMiddleware, optionalAuthMiddleware, Env, AuthContext } from './middleware/auth';
import { apiRateLimit, authRateLimit } from './middleware/rateLimit';
import { createDb } from './db';

// Import route handlers
import authRoutes from './routes/auth';
import clientRoutes from './routes/client';
import applicationRoutes from './routes/application';

// Initialize Hono app
const app = new Hono<{ Bindings: Env } & AuthContext>();

// Global middleware
app.use('*', logger());
app.use('*', prettyJSON());
app.use('*', createCorsMiddleware());

// Global error handler
app.onError((err, c) => {
  console.error('Error:', err);
  
  if (err instanceof HTTPException) {
    return c.json({
      errors: [{
        code: err.status.toString(),
        status: err.status.toString(),
        detail: err.message,
      }]
    }, err.status);
  }

  return c.json({
    errors: [{
      code: '500',
      status: '500',
      detail: 'Internal server error',
    }]
  }, 500);
});

// Health check endpoint
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: c.env.ENVIRONMENT,
  });
});

// API documentation endpoint
app.get('/', (c) => {
  return c.json({
    name: 'Pterodactyl Panel API',
    version: '2.0.0',
    description: 'Serverless Pterodactyl Panel API powered by Cloudflare Workers',
    documentation: 'https://pterodactyl.io/panel/2.0/api',
    endpoints: {
      auth: '/api/auth',
      client: '/api/client',
      application: '/api/application',
      health: '/health',
    },
    features: [
      'JWT Authentication',
      'Rate Limiting',
      'CORS Support',
      'Edge Computing',
      'Global Database Replication',
      'Automatic Scaling',
    ],
  });
});

// Authentication routes (no auth required)
app.route('/api/auth', authRoutes);

// Client API routes (authentication required)
app.use('/api/client/*', authMiddleware);
app.use('/api/client/*', apiRateLimit);
app.route('/api/client', clientRoutes);

// Application/Admin API routes (admin authentication required)
app.use('/api/application/*', authMiddleware);
app.use('/api/application/*', adminMiddleware);
app.use('/api/application/*', apiRateLimit);
app.route('/api/application', applicationRoutes);

// Handle 404 errors
app.notFound((c) => {
  return c.json({
    errors: [{
      code: '404',
      status: '404',
      detail: 'The requested resource could not be found.',
    }]
  }, 404);
});

export default app;