import { createErrorResponse } from '../utils/responses';
import { AppError } from '../utils/errors';
import type { RequestContext } from '../types';

/**
 * Global error handling middleware
 */
export class ErrorHandlerMiddleware {
  /**
   * Handle errors and convert them to appropriate HTTP responses
   */
  static async handleError(
    error: Error,
    request: Request,
    context: RequestContext
  ): Promise<Response> {
    console.error('Request error:', {
      message: error.message,
      stack: error.stack,
      url: request.url,
      method: request.method,
      userAgent: request.headers.get('user-agent'),
      ip: context.ip,
      userId: context.user?.id
    });

    // Handle custom application errors
    if (error instanceof AppError) {
      return createErrorResponse(
        error.message,
        error.statusCode,
        error.code,
        error.details
      );
    }

    // Handle validation errors from Zod
    if (error.name === 'ZodError') {
      return createErrorResponse(
        'Validation failed',
        400,
        'VALIDATION_ERROR',
        { errors: (error as any).errors }
      );
    }

    // Handle JWT errors
    if (error.message.includes('token') || error.message.includes('JWT')) {
      return createErrorResponse(
        'Authentication failed',
        401,
        'AUTHENTICATION_ERROR'
      );
    }

    // Handle database errors
    if (error.message.includes('database') || error.message.includes('D1')) {
      return createErrorResponse(
        'Database operation failed',
        500,
        'DATABASE_ERROR'
      );
    }

    // Handle rate limiting errors
    if (error.message.includes('rate limit')) {
      return createErrorResponse(
        'Rate limit exceeded',
        429,
        'RATE_LIMIT_EXCEEDED'
      );
    }

    // Handle permission errors
    if (error.message.includes('permission') || error.message.includes('forbidden')) {
      return createErrorResponse(
        'Access denied',
        403,
        'ACCESS_DENIED'
      );
    }

    // Handle not found errors
    if (error.message.includes('not found')) {
      return createErrorResponse(
        'Resource not found',
        404,
        'NOT_FOUND'
      );
    }

    // Handle network/fetch errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return createErrorResponse(
        'External service unavailable',
        503,
        'SERVICE_UNAVAILABLE'
      );
    }

    // Handle timeout errors
    if (error.message.includes('timeout')) {
      return createErrorResponse(
        'Request timeout',
        408,
        'REQUEST_TIMEOUT'
      );
    }

    // Handle generic errors
    const isDevelopment = context.env?.ENVIRONMENT === 'development';
    const message = isDevelopment 
      ? error.message 
      : 'An unexpected error occurred';
    
    const details = isDevelopment 
      ? { 
          error: error.message,
          stack: error.stack 
        } 
      : undefined;

    return createErrorResponse(
      message,
      500,
      'INTERNAL_SERVER_ERROR',
      details
    );
  }

  /**
   * Wrap async handlers to catch and handle errors
   */
  static wrapHandler(
    handler: (request: Request, context: RequestContext) => Promise<Response>
  ) {
    return async (request: Request, context: RequestContext): Promise<Response> => {
      try {
        return await handler(request, context);
      } catch (error) {
        return this.handleError(error as Error, request, context);
      }
    };
  }

  /**
   * Create a not found error response
   */
  static notFound(resource: string = 'Resource'): Response {
    return createErrorResponse(
      `${resource} not found`,
      404,
      'NOT_FOUND'
    );
  }

  /**
   * Create a method not allowed error response
   */
  static methodNotAllowed(allowedMethods: string[] = []): Response {
    const response = createErrorResponse(
      'Method not allowed',
      405,
      'METHOD_NOT_ALLOWED',
      { allowedMethods }
    );

    if (allowedMethods.length > 0) {
      response.headers.set('Allow', allowedMethods.join(', '));
    }

    return response;
  }

  /**
   * Create a bad request error response
   */
  static badRequest(message: string = 'Bad request', details?: any): Response {
    return createErrorResponse(
      message,
      400,
      'BAD_REQUEST',
      details
    );
  }

  /**
   * Create an unauthorized error response
   */
  static unauthorized(message: string = 'Authentication required'): Response {
    return createErrorResponse(
      message,
      401,
      'UNAUTHORIZED'
    );
  }

  /**
   * Create a forbidden error response
   */
  static forbidden(message: string = 'Access denied'): Response {
    return createErrorResponse(
      message,
      403,
      'FORBIDDEN'
    );
  }

  /**
   * Create a conflict error response
   */
  static conflict(message: string = 'Resource conflict', details?: any): Response {
    return createErrorResponse(
      message,
      409,
      'CONFLICT',
      details
    );
  }

  /**
   * Create an unprocessable entity error response
   */
  static unprocessableEntity(message: string = 'Validation failed', details?: any): Response {
    return createErrorResponse(
      message,
      422,
      'UNPROCESSABLE_ENTITY',
      details
    );
  }

  /**
   * Create a too many requests error response
   */
  static tooManyRequests(message: string = 'Rate limit exceeded', retryAfter?: number): Response {
    const response = createErrorResponse(
      message,
      429,
      'TOO_MANY_REQUESTS'
    );

    if (retryAfter) {
      response.headers.set('Retry-After', retryAfter.toString());
    }

    return response;
  }

  /**
   * Create an internal server error response
   */
  static internalServerError(message: string = 'Internal server error'): Response {
    return createErrorResponse(
      message,
      500,
      'INTERNAL_SERVER_ERROR'
    );
  }

  /**
   * Create a service unavailable error response
   */
  static serviceUnavailable(message: string = 'Service temporarily unavailable'): Response {
    return createErrorResponse(
      message,
      503,
      'SERVICE_UNAVAILABLE'
    );
  }

  /**
   * Log error for monitoring and debugging
   */
  private static logError(
    error: Error,
    request: Request,
    context: RequestContext
  ): void {
    // In production, you would send this to a logging service
    const logData = {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      request: {
        method: request.method,
        url: request.url,
        headers: Object.fromEntries(request.headers),
        userAgent: request.headers.get('user-agent')
      },
      context: {
        ip: context.ip,
        userId: context.user?.id,
        userAgent: context.userAgent
      }
    };

    console.error('Application Error:', JSON.stringify(logData, null, 2));
  }
}

/**
 * Async wrapper for handling errors in middleware chains
 */
export function asyncHandler(
  fn: (request: Request, context: RequestContext) => Promise<Response | null>
) {
  return async (request: Request, context: RequestContext): Promise<Response | null> => {
    try {
      return await fn(request, context);
    } catch (error) {
      // Return the error response, don't throw
      return ErrorHandlerMiddleware.handleError(error as Error, request, context);
    }
  };
}

/**
 * Error boundary for protecting critical sections
 */
export async function withErrorBoundary<T>(
  operation: () => Promise<T>,
  fallback?: T,
  onError?: (error: Error) => void
): Promise<T | undefined> {
  try {
    return await operation();
  } catch (error) {
    if (onError) {
      onError(error as Error);
    } else {
      console.error('Error boundary caught:', error);
    }
    return fallback;
  }
}

/**
 * Retry mechanism with exponential backoff
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}