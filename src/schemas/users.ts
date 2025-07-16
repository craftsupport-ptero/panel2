import { z } from 'zod';

// User validation schemas
export const UserCreateSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(255, 'Username must not exceed 255 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
  email: z.string()
    .email('Invalid email address')
    .max(255, 'Email must not exceed 255 characters'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(255, 'Password must not exceed 255 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  first_name: z.string()
    .min(1, 'First name is required')
    .max(255, 'First name must not exceed 255 characters'),
  last_name: z.string()
    .min(1, 'Last name is required')
    .max(255, 'Last name must not exceed 255 characters'),
  language: z.string().optional().default('en'),
  role: z.enum(['admin', 'moderator', 'user']).optional().default('user'),
  root_admin: z.boolean().optional().default(false)
});

export const UserUpdateSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(255, 'Username must not exceed 255 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')
    .optional(),
  email: z.string()
    .email('Invalid email address')
    .max(255, 'Email must not exceed 255 characters')
    .optional(),
  first_name: z.string()
    .min(1, 'First name is required')
    .max(255, 'First name must not exceed 255 characters')
    .optional(),
  last_name: z.string()
    .min(1, 'Last name is required')
    .max(255, 'Last name must not exceed 255 characters')
    .optional(),
  language: z.string().optional(),
  role: z.enum(['admin', 'moderator', 'user']).optional(),
  root_admin: z.boolean().optional()
});

export const ProfileUpdateSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .max(255, 'Email must not exceed 255 characters')
    .optional(),
  first_name: z.string()
    .min(1, 'First name is required')
    .max(255, 'First name must not exceed 255 characters')
    .optional(),
  last_name: z.string()
    .min(1, 'Last name is required')
    .max(255, 'Last name must not exceed 255 characters')
    .optional(),
  language: z.string().optional(),
  preferences: z.object({
    theme: z.enum(['light', 'dark']).optional(),
    notifications: z.boolean().optional(),
    language: z.string().optional(),
    timezone: z.string().optional()
  }).optional()
});

export const PasswordChangeSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: z.string()
    .min(8, 'New password must be at least 8 characters')
    .max(255, 'New password must not exceed 255 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'New password must contain at least one lowercase letter, one uppercase letter, and one number'),
  new_password_confirmation: z.string()
}).refine((data) => data.new_password === data.new_password_confirmation, {
  message: "New passwords don't match",
  path: ["new_password_confirmation"]
});

export const UserQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).optional().default(1),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional().default(10),
  search: z.string().optional(),
  role: z.enum(['admin', 'moderator', 'user']).optional(),
  sort: z.enum(['id', 'username', 'email', 'created_at', 'updated_at']).optional().default('id'),
  order: z.enum(['asc', 'desc']).optional().default('asc')
});

export const UserRoleUpdateSchema = z.object({
  role: z.enum(['admin', 'moderator', 'user']),
  root_admin: z.boolean().optional().default(false)
});

export const BulkUserUpdateSchema = z.object({
  user_ids: z.array(z.number().positive()),
  action: z.enum(['activate', 'suspend', 'delete', 'update_role']),
  data: z.object({
    role: z.enum(['admin', 'moderator', 'user']).optional(),
    root_admin: z.boolean().optional()
  }).optional()
});

// Helper function to validate and parse request data
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

// Export all schemas
export const UserSchemas = {
  UserCreateSchema,
  UserUpdateSchema,
  ProfileUpdateSchema,
  PasswordChangeSchema,
  UserQuerySchema,
  UserRoleUpdateSchema,
  BulkUserUpdateSchema
};