import { z } from 'zod';

/**
 * Common validation schemas used across the application
 */

// ID parameter schema
export const idParamSchema = z.object({
  id: z.string()
    .transform(val => {
      const parsed = parseInt(val, 10);
      if (isNaN(parsed) || parsed <= 0) {
        throw new Error('Invalid ID');
      }
      return parsed;
    })
});

export type IdParam = z.infer<typeof idParamSchema>;

// UUID parameter schema
export const uuidParamSchema = z.object({
  id: z.string()
    .uuid('Invalid UUID format')
});

export type UuidParam = z.infer<typeof uuidParamSchema>;

// Pagination schema
export const paginationSchema = z.object({
  page: z.string()
    .optional()
    .transform(val => val ? parseInt(val, 10) : 1)
    .refine(val => val > 0, 'Page must be greater than 0'),
  limit: z.string()
    .optional()
    .transform(val => val ? parseInt(val, 10) : 25)
    .refine(val => val > 0 && val <= 100, 'Limit must be between 1 and 100'),
  sort: z.string()
    .optional()
    .refine(val => !val || /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(val), 'Invalid sort field'),
  order: z.enum(['asc', 'desc'])
    .optional()
    .default('asc')
});

export type Pagination = z.infer<typeof paginationSchema>;

// Search schema
export const searchSchema = z.object({
  q: z.string()
    .min(1, 'Search query cannot be empty')
    .max(255, 'Search query too long')
    .optional(),
  filter: z.string()
    .max(255, 'Filter too long')
    .optional(),
  ...paginationSchema.shape
});

export type Search = z.infer<typeof searchSchema>;

// Date range schema
export const dateRangeSchema = z.object({
  start_date: z.string()
    .datetime('Invalid start date format')
    .optional(),
  end_date: z.string()
    .datetime('Invalid end date format')
    .optional()
}).refine(data => {
  if (data.start_date && data.end_date) {
    return new Date(data.start_date) <= new Date(data.end_date);
  }
  return true;
}, 'Start date must be before end date');

export type DateRange = z.infer<typeof dateRangeSchema>;

// Email schema
export const emailSchema = z.string()
  .email('Invalid email address')
  .max(255, 'Email too long')
  .transform(val => val.toLowerCase().trim());

// Username schema
export const usernameSchema = z.string()
  .min(3, 'Username must be at least 3 characters')
  .max(255, 'Username too long')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')
  .transform(val => val.toLowerCase().trim());

// Password schema
export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(255, 'Password too long')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/, 
         'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character');

// Name schema
export const nameSchema = z.string()
  .min(1, 'Name is required')
  .max(255, 'Name too long')
  .regex(/^[a-zA-Z\s\-'\.]+$/, 'Name can only contain letters, spaces, hyphens, apostrophes, and periods')
  .transform(val => val.trim());

// IP address schema
export const ipAddressSchema = z.string()
  .ip('Invalid IP address');

// URL schema
export const urlSchema = z.string()
  .url('Invalid URL')
  .max(2048, 'URL too long');

// Slug schema (for URLs)
export const slugSchema = z.string()
  .min(1, 'Slug is required')
  .max(255, 'Slug too long')
  .regex(/^[a-z0-9\-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
  .refine(val => !val.startsWith('-') && !val.endsWith('-'), 'Slug cannot start or end with a hyphen');

// File upload schema
export const fileUploadSchema = z.object({
  filename: z.string()
    .min(1, 'Filename is required')
    .max(255, 'Filename too long')
    .refine(val => !/[<>:"/\\|?*]/.test(val), 'Filename contains invalid characters'),
  size: z.number()
    .int('File size must be an integer')
    .min(0, 'File size cannot be negative')
    .max(100 * 1024 * 1024, 'File size cannot exceed 100MB'), // 100MB
  type: z.string()
    .min(1, 'File type is required')
    .max(255, 'File type too long')
});

export type FileUpload = z.infer<typeof fileUploadSchema>;

// Color schema (hex color)
export const colorSchema = z.string()
  .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color format');

// Language code schema
export const languageSchema = z.string()
  .regex(/^[a-z]{2}(-[A-Z]{2})?$/, 'Invalid language code format')
  .max(10, 'Language code too long');

// Timezone schema
export const timezoneSchema = z.string()
  .max(50, 'Timezone too long')
  .refine(val => {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: val });
      return true;
    } catch {
      return false;
    }
  }, 'Invalid timezone');

// JSON schema (for storing JSON data)
export const jsonSchema = z.union([
  z.record(z.any()),
  z.array(z.any()),
  z.string(),
  z.number(),
  z.boolean(),
  z.null()
]);

// Environment schema
export const environmentSchema = z.enum(['development', 'staging', 'production']);

// Status schema
export const statusSchema = z.enum(['active', 'inactive', 'suspended', 'pending']);

// Boolean string schema (for query parameters)
export const booleanStringSchema = z.string()
  .transform(val => {
    const lower = val.toLowerCase();
    if (lower === 'true' || lower === '1' || lower === 'yes') return true;
    if (lower === 'false' || lower === '0' || lower === 'no') return false;
    throw new Error('Invalid boolean value');
  });

// Array of strings schema (for comma-separated values)
export const stringArraySchema = z.string()
  .transform(val => val.split(',').map(s => s.trim()).filter(s => s.length > 0))
  .pipe(z.array(z.string().min(1)));

// Array of numbers schema (for comma-separated values)
export const numberArraySchema = z.string()
  .transform(val => {
    const numbers = val.split(',').map(s => s.trim()).filter(s => s.length > 0);
    return numbers.map(n => {
      const parsed = parseInt(n, 10);
      if (isNaN(parsed)) throw new Error(`Invalid number: ${n}`);
      return parsed;
    });
  })
  .pipe(z.array(z.number()));

// Base API response schema
export const baseResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional(),
  meta: z.object({
    pagination: z.object({
      page: z.number(),
      perPage: z.number(),
      total: z.number(),
      totalPages: z.number()
    }).optional(),
    rateLimit: z.object({
      limit: z.number(),
      remaining: z.number(),
      resetTime: z.number()
    }).optional()
  }).optional(),
  error: z.string().optional(),
  code: z.string().optional(),
  details: z.any().optional()
});

export type BaseResponse = z.infer<typeof baseResponseSchema>;

// Request metadata schema
export const requestMetadataSchema = z.object({
  timestamp: z.string().datetime(),
  requestId: z.string().uuid(),
  userAgent: z.string().optional(),
  ip: z.string().ip().optional(),
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD']),
  path: z.string()
});

export type RequestMetadata = z.infer<typeof requestMetadataSchema>;

// API key permissions schema
export const permissionsSchema = z.array(
  z.string().regex(/^[a-z]+(\.[a-z*]+)*$/, 'Invalid permission format')
).min(1, 'At least one permission is required');

// Rate limit configuration schema
export const rateLimitConfigSchema = z.object({
  limit: z.number().int().min(1, 'Limit must be at least 1'),
  window: z.number().int().min(1, 'Window must be at least 1 second'),
  message: z.string().optional()
});

export type RateLimitConfig = z.infer<typeof rateLimitConfigSchema>;

/**
 * Utility functions for common validation patterns
 */

// Validate and transform comma-separated string to array
export function parseCommaSeparated(value: string): string[] {
  return value.split(',').map(s => s.trim()).filter(s => s.length > 0);
}

// Validate and transform string to positive integer
export function parsePositiveInt(value: string, fieldName: string = 'value'): number {
  const parsed = parseInt(value, 10);
  if (isNaN(parsed) || parsed <= 0) {
    throw new Error(`${fieldName} must be a positive integer`);
  }
  return parsed;
}

// Validate and transform string to non-negative integer
export function parseNonNegativeInt(value: string, fieldName: string = 'value'): number {
  const parsed = parseInt(value, 10);
  if (isNaN(parsed) || parsed < 0) {
    throw new Error(`${fieldName} must be a non-negative integer`);
  }
  return parsed;
}

// Validate email and normalize
export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

// Validate and normalize username
export function normalizeUsername(username: string): string {
  return username.toLowerCase().trim();
}