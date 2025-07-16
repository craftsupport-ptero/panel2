export const APP_CONFIG = {
  // Application info
  NAME: 'Pterodactyl Panel',
  VERSION: '2.0.0-serverless',
  
  // Default pagination
  DEFAULT_PAGE_SIZE: 25,
  MAX_PAGE_SIZE: 100,
  
  // Security
  DEFAULT_BCRYPT_ROUNDS: 12,
  JWT_EXPIRY: '24h',
  
  // Rate limiting
  DEFAULT_RATE_LIMIT_WINDOW: 60, // seconds
  DEFAULT_RATE_LIMIT_MAX_REQUESTS: 100,
  
  // Server limits
  DEFAULT_SERVER_MEMORY: 512, // MB
  DEFAULT_SERVER_DISK: 1024, // MB
  DEFAULT_SERVER_CPU: 100, // %
  
  // Database limits
  MAX_DATABASES_PER_SERVER: 5,
  
  // API Keys
  API_KEY_LENGTH: 48,
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const CACHE_KEYS = {
  USER_PREFIX: 'user:',
  SERVER_PREFIX: 'server:',
  NODE_PREFIX: 'node:',
  LOCATION_PREFIX: 'location:',
  SESSION_PREFIX: 'session:',
} as const;

export const PERMISSIONS = {
  // User permissions
  USER_CREATE: 'user.create',
  USER_READ: 'user.read',
  USER_UPDATE: 'user.update',
  USER_DELETE: 'user.delete',
  
  // Server permissions
  SERVER_CREATE: 'server.create',
  SERVER_READ: 'server.read',
  SERVER_UPDATE: 'server.update',
  SERVER_DELETE: 'server.delete',
  SERVER_CONSOLE: 'server.console',
  SERVER_POWER: 'server.power',
  
  // Node permissions
  NODE_CREATE: 'node.create',
  NODE_READ: 'node.read',
  NODE_UPDATE: 'node.update',
  NODE_DELETE: 'node.delete',
  
  // Admin permissions
  ADMIN_ALL: 'admin.*',
} as const;