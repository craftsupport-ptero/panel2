import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { cors } from 'hono/cors';

// Route imports
import authRoutes from './routes/auth';
import clientRoutes from './routes/client';
import applicationRoutes from './routes/application';

// Middleware imports
import { corsMiddleware, rateLimitMiddleware } from './middleware/auth';
import type { Env } from './types';

const app = new Hono<{ Bindings: Env }>();

// Global middleware
app.use('*', logger());
app.use('*', prettyJSON());
app.use('*', corsMiddleware);
app.use('*', rateLimitMiddleware);

// Health check endpoint
app.get('/', (c) => {
  return c.json({
    message: 'Pterodactyl Panel Serverless API',
    version: '2.0.0',
    status: 'operational',
    environment: c.env.ENVIRONMENT || 'development',
    timestamp: new Date().toISOString(),
  });
});

// Health check endpoint
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime?.() || 0,
  });
});

// API version info
app.get('/api', (c) => {
  return c.json({
    version: '2.0.0',
    name: 'Pterodactyl Panel API',
    links: {
      documentation: 'https://pterodactyl.io/api',
      source: 'https://github.com/pterodactyl/panel',
    },
    supported_versions: ['application/vnd.pterodactyl.v1+json'],
  });
});

// Mount route handlers
app.route('/api/auth', authRoutes);
app.route('/api/client', clientRoutes);
app.route('/api/application', applicationRoutes);

// 404 handler
app.notFound((c) => {
  return c.json({
    errors: [{
      code: 'NotFoundHttpException',
      status: '404',
      detail: 'The resource you are looking for could not be found.',
    }],
  }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Application error:', err);

  // Check if it's a development environment for detailed error info
  const isDevelopment = c.env?.ENVIRONMENT === 'development';

  return c.json({
    errors: [{
      code: 'InternalServerError',
      status: '500',
      detail: isDevelopment ? err.message : 'An internal server error occurred.',
      ...(isDevelopment && { stack: err.stack }),
    }],
  }, 500);
});

// Handle CORS preflight requests
app.options('*', (c) => {
  return c.text('', 204);
});

export default app;