import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import type { Env } from './types/env';
import { initializeDb, users } from './db';
import { APP_CONFIG, HTTP_STATUS } from './utils/constants';

const app = new Hono<{ Bindings: Env }>();

// Middleware
app.use('*', logger());
app.use('*', prettyJSON());
app.use('*', cors({
  origin: ['http://localhost:3000', 'https://*.pterodactyl.io'],
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
  credentials: true,
}));

// Health check endpoint
app.get('/health', async (c) => {
  try {
    // Initialize database connection
    const db = initializeDb(c.env);
    
    // Test database connectivity
    const testQuery = await db.select().from(users).limit(1);
    
    return c.json({
      status: 'healthy',
      version: APP_CONFIG.VERSION,
      timestamp: new Date().toISOString(),
      database: 'connected',
      environment: c.env.ENVIRONMENT
    });
  } catch (error) {
    return c.json({
      status: 'unhealthy',
      version: APP_CONFIG.VERSION,
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      environment: c.env.ENVIRONMENT,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
});

// API version endpoint
app.get('/api/version', (c) => {
  return c.json({
    name: APP_CONFIG.NAME,
    version: APP_CONFIG.VERSION,
    environment: c.env.ENVIRONMENT,
  });
});

// 404 handler
app.notFound((c) => {
  return c.json({
    error: 'Not Found',
    message: 'The requested resource was not found on this server.',
  }, HTTP_STATUS.NOT_FOUND);
});

// Error handler
app.onError((err, c) => {
  console.error('Application error:', err);
  
  return c.json({
    error: 'Internal Server Error',
    message: 'An unexpected error occurred.',
    ...(c.env.ENVIRONMENT === 'development' && {
      stack: err.stack,
      details: err.message
    })
  }, HTTP_STATUS.INTERNAL_SERVER_ERROR);
});

export default app;