import { z } from 'zod';

// Authentication schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  recaptcha: z.string().optional(),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  passwordConfirmation: z.string(),
  firstName: z.string().min(1, 'First name is required').max(255),
  lastName: z.string().min(1, 'Last name is required').max(255),
  username: z.string().min(3, 'Username must be at least 3 characters').max(255),
}).refine((data) => data.password === data.passwordConfirmation, {
  message: "Passwords don't match",
  path: ["passwordConfirmation"],
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  passwordConfirmation: z.string(),
}).refine((data) => data.password === data.passwordConfirmation, {
  message: "Passwords don't match",
  path: ["passwordConfirmation"],
});

export const updateEmailSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Server schemas
export const createServerSchema = z.object({
  name: z.string().min(1, 'Server name is required').max(255),
  description: z.string().max(255).optional(),
  ownerId: z.number().int().positive(),
  eggId: z.number().int().positive(),
  dockerImage: z.string().min(1, 'Docker image is required'),
  startup: z.string().min(1, 'Startup command is required'),
  limits: z.object({
    memory: z.number().int().min(0),
    swap: z.number().int().min(-1),
    disk: z.number().int().min(0),
    io: z.number().int().min(10).max(1000),
    cpu: z.number().int().min(0),
    threads: z.string().optional(),
  }),
  featureLimits: z.object({
    databases: z.number().int().min(0).optional(),
    allocations: z.number().int().min(0).optional(),
    backups: z.number().int().min(0).optional(),
  }),
  allocation: z.object({
    default: z.number().int().positive(),
    additional: z.array(z.number().int().positive()).optional(),
  }),
  environment: z.record(z.string(), z.any()).optional(),
  externalId: z.string().max(191).optional(),
  skipScripts: z.boolean().optional(),
});

export const updateServerDetailsSchema = z.object({
  name: z.string().min(1, 'Server name is required').max(255),
  description: z.string().max(255).nullable(),
  externalId: z.string().max(191).nullable(),
});

export const updateServerStartupSchema = z.object({
  startup: z.string().min(1, 'Startup command is required'),
  environment: z.record(z.string(), z.any()),
  eggId: z.number().int().positive(),
  image: z.string().min(1, 'Docker image is required'),
  skipScripts: z.boolean().optional(),
});

export const updateServerBuildSchema = z.object({
  limits: z.object({
    memory: z.number().int().min(0),
    swap: z.number().int().min(-1),
    disk: z.number().int().min(0),
    io: z.number().int().min(10).max(1000),
    cpu: z.number().int().min(0),
    threads: z.string().nullable(),
    oomDisabled: z.boolean().optional(),
  }),
  featureLimits: z.object({
    databases: z.number().int().min(0).nullable(),
    allocations: z.number().int().min(0).nullable(),
    backups: z.number().int().min(0).nullable(),
  }),
  allocation: z.number().int().positive(),
  addAllocations: z.array(z.number().int().positive()).optional(),
  removeAllocations: z.array(z.number().int().positive()).optional(),
});

// User management schemas
export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(255),
  firstName: z.string().min(1, 'First name is required').max(255),
  lastName: z.string().min(1, 'Last name is required').max(255),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  rootAdmin: z.boolean().optional(),
  language: z.string().length(5).optional(),
  externalId: z.string().max(191).optional(),
});

export const updateUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(255),
  firstName: z.string().min(1, 'First name is required').max(255),
  lastName: z.string().min(1, 'Last name is required').max(255),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  rootAdmin: z.boolean().optional(),
  language: z.string().length(5).optional(),
  externalId: z.string().max(191).nullable(),
});

// Node schemas
export const createNodeSchema = z.object({
  name: z.string().min(1, 'Node name is required').max(255),
  description: z.string().max(255).optional(),
  locationId: z.number().int().positive(),
  fqdn: z.string().min(1, 'FQDN is required').max(255),
  scheme: z.enum(['http', 'https']).default('https'),
  behindProxy: z.boolean().default(false),
  maintenanceMode: z.boolean().default(false),
  memory: z.number().int().min(1),
  memoryOverallocate: z.number().int().min(-1).default(0),
  disk: z.number().int().min(1),
  diskOverallocate: z.number().int().min(-1).default(0),
  daemonListen: z.number().int().min(1).max(65535).default(8080),
  daemonSftp: z.number().int().min(1).max(65535).default(2022),
  daemonBase: z.string().default('/var/lib/pterodactyl/volumes'),
  uploadSize: z.number().int().min(1).max(1024).default(100),
});

export const updateNodeSchema = createNodeSchema.partial().omit({ locationId: true }).extend({
  locationId: z.number().int().positive().optional(),
});

// Location schemas
export const createLocationSchema = z.object({
  short: z.string().min(1, 'Short name is required').max(60),
  long: z.string().max(255).optional(),
});

export const updateLocationSchema = createLocationSchema;

// Database schemas
export const createDatabaseSchema = z.object({
  database: z.string().min(1, 'Database name is required').max(48),
  remote: z.string().default('%'),
  hostId: z.number().int().positive(),
});

// Backup schemas
export const createBackupSchema = z.object({
  name: z.string().min(1, 'Backup name is required').max(255),
  ignored: z.string().optional(),
  locked: z.boolean().default(false),
});

// API Key schemas
export const createApiKeySchema = z.object({
  description: z.string().min(1, 'Description is required').max(255),
  allowedIps: z.array(z.string().ip()).optional(),
  expiresAt: z.string().datetime().optional(),
});

// Allocation schemas
export const createAllocationSchema = z.object({
  ip: z.string().ip(),
  ports: z.array(z.string()).min(1, 'At least one port is required'),
  alias: z.string().max(255).optional(),
});

// Pagination schemas
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(25),
  sort: z.string().optional(),
  filter: z.record(z.string(), z.any()).optional(),
});

// Common response schemas
export const errorResponseSchema = z.object({
  code: z.string(),
  status: z.string(),
  detail: z.string(),
});

export const successResponseSchema = z.object({
  object: z.string(),
  attributes: z.any(),
});

export const paginatedResponseSchema = z.object({
  object: z.literal('list'),
  data: z.array(z.any()),
  meta: z.object({
    pagination: z.object({
      total: z.number(),
      count: z.number(),
      perPage: z.number(),
      currentPage: z.number(),
      totalPages: z.number(),
      links: z.object({
        next: z.string().optional(),
        previous: z.string().optional(),
      }),
    }),
  }),
});

// Export types
export type LoginRequest = z.infer<typeof loginSchema>;
export type RegisterRequest = z.infer<typeof registerSchema>;
export type CreateServerRequest = z.infer<typeof createServerSchema>;
export type UpdateServerDetailsRequest = z.infer<typeof updateServerDetailsSchema>;
export type CreateUserRequest = z.infer<typeof createUserSchema>;
export type UpdateUserRequest = z.infer<typeof updateUserSchema>;
export type CreateNodeRequest = z.infer<typeof createNodeSchema>;
export type UpdateNodeRequest = z.infer<typeof updateNodeSchema>;
export type CreateLocationRequest = z.infer<typeof createLocationSchema>;
export type CreateDatabaseRequest = z.infer<typeof createDatabaseSchema>;
export type CreateBackupRequest = z.infer<typeof createBackupSchema>;
export type CreateApiKeyRequest = z.infer<typeof createApiKeySchema>;
export type PaginationRequest = z.infer<typeof paginationSchema>;