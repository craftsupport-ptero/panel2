/**
 * Custom error classes for the application
 */

/**
 * Base application error class
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: any;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    details?: any,
    isOperational: boolean = true
  ) {
    super(message);
    
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = isOperational;

    // Maintains proper stack trace for where error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Authentication related errors
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed', details?: any) {
    super(message, 401, 'AUTHENTICATION_ERROR', details);
  }
}

export class InvalidTokenError extends AuthenticationError {
  constructor(message: string = 'Invalid or expired token') {
    super(message, { code: 'INVALID_TOKEN' });
  }
}

export class TokenExpiredError extends AuthenticationError {
  constructor(message: string = 'Token has expired') {
    super(message, { code: 'TOKEN_EXPIRED' });
  }
}

export class InvalidCredentialsError extends AuthenticationError {
  constructor(message: string = 'Invalid username or password') {
    super(message, { code: 'INVALID_CREDENTIALS' });
  }
}

/**
 * Authorization related errors
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied', details?: any) {
    super(message, 403, 'AUTHORIZATION_ERROR', details);
  }
}

export class InsufficientPermissionsError extends AuthorizationError {
  constructor(permission?: string) {
    const message = permission 
      ? `Permission '${permission}' required`
      : 'Insufficient permissions';
    super(message, { requiredPermission: permission });
  }
}

export class AdminRequiredError extends AuthorizationError {
  constructor(message: string = 'Admin access required') {
    super(message, { code: 'ADMIN_REQUIRED' });
  }
}

/**
 * Validation related errors
 */
export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', errors?: any[]) {
    super(message, 400, 'VALIDATION_ERROR', { errors });
  }
}

export class InvalidInputError extends ValidationError {
  constructor(field: string, reason?: string) {
    const message = reason 
      ? `Invalid value for field '${field}': ${reason}`
      : `Invalid value for field '${field}'`;
    super(message, [{ field, reason }]);
  }
}

export class MissingFieldError extends ValidationError {
  constructor(field: string) {
    super(`Required field '${field}' is missing`, [{ field, reason: 'required' }]);
  }
}

/**
 * Resource related errors
 */
export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource', id?: string | number) {
    const message = id 
      ? `${resource} with ID '${id}' not found`
      : `${resource} not found`;
    super(message, 404, 'NOT_FOUND', { resource, id });
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists', details?: any) {
    super(message, 409, 'CONFLICT', details);
  }
}

export class DuplicateResourceError extends ConflictError {
  constructor(resource: string, field: string, value: string) {
    super(
      `${resource} with ${field} '${value}' already exists`,
      { resource, field, value }
    );
  }
}

/**
 * Rate limiting errors
 */
export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded', retryAfter?: number) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED', { retryAfter });
  }
}

/**
 * Database related errors
 */
export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed', details?: any) {
    super(message, 500, 'DATABASE_ERROR', details);
  }
}

export class ConnectionError extends DatabaseError {
  constructor(message: string = 'Database connection failed') {
    super(message, { code: 'CONNECTION_FAILED' });
  }
}

export class QueryError extends DatabaseError {
  constructor(query: string, error: string) {
    super(`Query execution failed: ${error}`, { query, error });
  }
}

/**
 * External service errors
 */
export class ServiceError extends AppError {
  constructor(service: string, message: string = 'Service unavailable', details?: any) {
    super(`${service}: ${message}`, 503, 'SERVICE_ERROR', { service, ...details });
  }
}

export class TimeoutError extends ServiceError {
  constructor(service: string, timeout: number) {
    super(service, `Request timeout after ${timeout}ms`, { timeout });
  }
}

/**
 * File operation errors
 */
export class FileError extends AppError {
  constructor(message: string = 'File operation failed', details?: any) {
    super(message, 400, 'FILE_ERROR', details);
  }
}

export class FileTooLargeError extends FileError {
  constructor(size: number, maxSize: number) {
    super(
      `File size ${size} bytes exceeds maximum allowed size of ${maxSize} bytes`,
      { size, maxSize }
    );
  }
}

export class InvalidFileTypeError extends FileError {
  constructor(type: string, allowedTypes: string[]) {
    super(
      `File type '${type}' is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
      { type, allowedTypes }
    );
  }
}

/**
 * Configuration errors
 */
export class ConfigurationError extends AppError {
  constructor(message: string = 'Configuration error', details?: any) {
    super(message, 500, 'CONFIGURATION_ERROR', details, false);
  }
}

export class MissingEnvironmentVariableError extends ConfigurationError {
  constructor(variable: string) {
    super(
      `Required environment variable '${variable}' is not set`,
      { variable }
    );
  }
}

/**
 * Security related errors
 */
export class SecurityError extends AppError {
  constructor(message: string = 'Security violation', details?: any) {
    super(message, 403, 'SECURITY_ERROR', details);
  }
}

export class SuspiciousActivityError extends SecurityError {
  constructor(activity: string, details?: any) {
    super(`Suspicious activity detected: ${activity}`, { activity, ...details });
  }
}

export class IPBlockedError extends SecurityError {
  constructor(ip: string) {
    super(`IP address ${ip} is blocked`, { ip });
  }
}

/**
 * Utility functions for error handling
 */

/**
 * Check if error is operational (expected) or programming error
 */
export function isOperationalError(error: Error): boolean {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
}

/**
 * Extract error details for logging
 */
export function getErrorDetails(error: Error): {
  name: string;
  message: string;
  statusCode?: number;
  code?: string;
  details?: any;
  stack?: string;
} {
  const details: any = {
    name: error.name,
    message: error.message,
    stack: error.stack
  };

  if (error instanceof AppError) {
    details.statusCode = error.statusCode;
    details.code = error.code;
    details.details = error.details;
  }

  return details;
}

/**
 * Create error from unknown value
 */
export function ensureError(value: unknown): Error {
  if (value instanceof Error) {
    return value;
  }
  
  if (typeof value === 'string') {
    return new Error(value);
  }
  
  return new Error('Unknown error occurred');
}

/**
 * Wrap async operations with proper error handling
 */
export async function safeAsync<T>(
  operation: () => Promise<T>,
  errorMessage?: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    
    const message = errorMessage || 'Operation failed';
    throw new AppError(message, 500, 'OPERATION_FAILED', { originalError: error });
  }
}