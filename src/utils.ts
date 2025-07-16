import { ApiResponse } from '@/types';
import { ZodError } from 'zod';

/**
 * Create a standardized API response
 */
export function createResponse<T>(
  success: boolean,
  data?: T,
  error?: { message: string; code?: string; details?: any }
): ApiResponse<T> {
  return {
    success,
    data,
    error
  };
}

/**
 * Create a success response
 */
export function successResponse<T>(data: T): ApiResponse<T> {
  return createResponse(true, data);
}

/**
 * Create an error response
 */
export function errorResponse(
  message: string,
  code?: string,
  details?: any
): ApiResponse<never> {
  return createResponse(false, undefined, { message, code, details });
}

/**
 * Create a validation error response from Zod error
 */
export function validationErrorResponse(error: ZodError): ApiResponse<never> {
  const details = error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code
  }));

  return errorResponse(
    'Validation failed',
    'VALIDATION_ERROR',
    details
  );
}

/**
 * Handle errors and return appropriate response
 */
export function handleError(error: unknown): ApiResponse<never> {
  console.error('API Error:', error);

  if (error instanceof ZodError) {
    return validationErrorResponse(error);
  }

  if (error instanceof Error) {
    return errorResponse(error.message, 'INTERNAL_ERROR');
  }

  return errorResponse('An unexpected error occurred', 'UNKNOWN_ERROR');
}

/**
 * Extract pagination parameters from URL search params
 */
export function extractPaginationParams(searchParams: URLSearchParams) {
  return {
    page: Math.max(1, parseInt(searchParams.get('page') || '1', 10)),
    limit: Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10', 10))),
    search: searchParams.get('search') || undefined,
    sort: searchParams.get('sort') || 'id',
    order: (searchParams.get('order') || 'asc') as 'asc' | 'desc'
  };
}

/**
 * Calculate pagination metadata
 */
export function calculatePagination(page: number, limit: number, total: number) {
  const pages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    pages,
    hasNext: page < pages,
    hasPrev: page > 1
  };
}

/**
 * Generate a random string for tokens, etc.
 */
export function generateRandomString(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .trim();
}

/**
 * Check if email is valid format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Format date to ISO string
 */
export function formatDate(date: Date): string {
  return date.toISOString();
}

/**
 * Get current timestamp as ISO string
 */
export function getCurrentTimestamp(): string {
  return formatDate(new Date());
}

/**
 * Parse JSON safely
 */
export function safeParseJSON<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

/**
 * Create a slugified version of a string
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Check if value is empty (null, undefined, empty string, empty array)
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Debounce function for rate limiting
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
}

/**
 * Create CORS headers for responses
 */
export function createCorsHeaders(origin?: string): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400'
  };
}

/**
 * Parse Bearer token from Authorization header
 */
export function parseBearerToken(authHeader?: string): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}