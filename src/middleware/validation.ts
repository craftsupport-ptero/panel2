import { z } from 'zod';
import { createErrorResponse } from '../utils/responses';
import type { RequestContext } from '../types';

/**
 * Request validation middleware using Zod schemas
 */
export class ValidationMiddleware {
  /**
   * Validate request body against a schema
   */
  static validateBody<T>(schema: z.ZodSchema<T>) {
    return async (request: Request, context: RequestContext): Promise<Response | null> => {
      try {
        // Only validate if request has a body
        if (!request.body || request.headers.get('content-length') === '0') {
          const result = schema.safeParse({});
          if (!result.success) {
            return createErrorResponse(
              'Request body is required',
              400,
              'VALIDATION_ERROR',
              { errors: result.error.errors }
            );
          }
          return null;
        }

        const contentType = request.headers.get('content-type') || '';
        let body: any;

        if (contentType.includes('application/json')) {
          const text = await request.text();
          if (!text) {
            body = {};
          } else {
            try {
              body = JSON.parse(text);
            } catch (error) {
              return createErrorResponse(
                'Invalid JSON in request body',
                400,
                'INVALID_JSON'
              );
            }
          }
        } else if (contentType.includes('application/x-www-form-urlencoded')) {
          const formData = await request.formData();
          body = Object.fromEntries(formData);
        } else {
          return createErrorResponse(
            'Unsupported content type. Expected application/json or application/x-www-form-urlencoded',
            400,
            'UNSUPPORTED_CONTENT_TYPE'
          );
        }

        const result = schema.safeParse(body);
        if (!result.success) {
          return createErrorResponse(
            'Validation failed',
            400,
            'VALIDATION_ERROR',
            { errors: result.error.errors }
          );
        }

        // Store validated data in context
        context.validatedBody = result.data;
        return null;
      } catch (error) {
        console.error('Validation error:', error);
        return createErrorResponse(
          'Request validation failed',
          400,
          'VALIDATION_ERROR'
        );
      }
    };
  }

  /**
   * Validate query parameters against a schema
   */
  static validateQuery<T>(schema: z.ZodSchema<T>) {
    return async (request: Request, context: RequestContext): Promise<Response | null> => {
      try {
        const url = new URL(request.url);
        const queryParams: Record<string, any> = {};
        
        // Convert URLSearchParams to object
        for (const [key, value] of url.searchParams) {
          if (queryParams[key]) {
            // Handle multiple values for same key
            if (Array.isArray(queryParams[key])) {
              queryParams[key].push(value);
            } else {
              queryParams[key] = [queryParams[key], value];
            }
          } else {
            queryParams[key] = value;
          }
        }

        const result = schema.safeParse(queryParams);
        if (!result.success) {
          return createErrorResponse(
            'Invalid query parameters',
            400,
            'VALIDATION_ERROR',
            { errors: result.error.errors }
          );
        }

        // Store validated data in context
        context.validatedQuery = result.data;
        return null;
      } catch (error) {
        console.error('Query validation error:', error);
        return createErrorResponse(
          'Query parameter validation failed',
          400,
          'VALIDATION_ERROR'
        );
      }
    };
  }

  /**
   * Validate URL parameters against a schema
   */
  static validateParams<T>(schema: z.ZodSchema<T>) {
    return async (request: Request, context: RequestContext): Promise<Response | null> => {
      try {
        const result = schema.safeParse(context.params || {});
        if (!result.success) {
          return createErrorResponse(
            'Invalid URL parameters',
            400,
            'VALIDATION_ERROR',
            { errors: result.error.errors }
          );
        }

        // Store validated data in context
        context.validatedParams = result.data;
        return null;
      } catch (error) {
        console.error('Params validation error:', error);
        return createErrorResponse(
          'URL parameter validation failed',
          400,
          'VALIDATION_ERROR'
        );
      }
    };
  }

  /**
   * Validate request headers against a schema
   */
  static validateHeaders<T>(schema: z.ZodSchema<T>) {
    return async (request: Request, context: RequestContext): Promise<Response | null> => {
      try {
        const headers: Record<string, string> = {};
        
        // Convert Headers to object
        for (const [key, value] of request.headers) {
          headers[key.toLowerCase()] = value;
        }

        const result = schema.safeParse(headers);
        if (!result.success) {
          return createErrorResponse(
            'Invalid request headers',
            400,
            'VALIDATION_ERROR',
            { errors: result.error.errors }
          );
        }

        // Store validated data in context
        context.validatedHeaders = result.data;
        return null;
      } catch (error) {
        console.error('Headers validation error:', error);
        return createErrorResponse(
          'Header validation failed',
          400,
          'VALIDATION_ERROR'
        );
      }
    };
  }

  /**
   * Validate file uploads
   */
  static validateFile(options: FileValidationOptions = {}) {
    return async (request: Request, context: RequestContext): Promise<Response | null> => {
      try {
        const contentType = request.headers.get('content-type') || '';
        
        if (!contentType.includes('multipart/form-data')) {
          return createErrorResponse(
            'File upload requires multipart/form-data content type',
            400,
            'INVALID_CONTENT_TYPE'
          );
        }

        const formData = await request.formData();
        const files: File[] = [];
        
        for (const [key, value] of formData) {
          if (value instanceof File) {
            // Validate file size
            if (options.maxSize && value.size > options.maxSize) {
              return createErrorResponse(
                `File '${value.name}' exceeds maximum size of ${options.maxSize} bytes`,
                400,
                'FILE_TOO_LARGE'
              );
            }

            // Validate file type
            if (options.allowedTypes && !options.allowedTypes.includes(value.type)) {
              return createErrorResponse(
                `File type '${value.type}' is not allowed`,
                400,
                'INVALID_FILE_TYPE'
              );
            }

            // Validate file extension
            if (options.allowedExtensions) {
              const extension = value.name.split('.').pop()?.toLowerCase();
              if (!extension || !options.allowedExtensions.includes(extension)) {
                return createErrorResponse(
                  `File extension '${extension}' is not allowed`,
                  400,
                  'INVALID_FILE_EXTENSION'
                );
              }
            }

            files.push(value);
          }
        }

        // Validate number of files
        if (options.maxFiles && files.length > options.maxFiles) {
          return createErrorResponse(
            `Too many files. Maximum allowed: ${options.maxFiles}`,
            400,
            'TOO_MANY_FILES'
          );
        }

        if (options.required && files.length === 0) {
          return createErrorResponse(
            'At least one file is required',
            400,
            'NO_FILES_UPLOADED'
          );
        }

        // Store files in context
        context.uploadedFiles = files;
        context.formData = formData;
        
        return null;
      } catch (error) {
        console.error('File validation error:', error);
        return createErrorResponse(
          'File validation failed',
          400,
          'FILE_VALIDATION_ERROR'
        );
      }
    };
  }
}

/**
 * File validation options
 */
export interface FileValidationOptions {
  maxSize?: number;           // Maximum file size in bytes
  maxFiles?: number;          // Maximum number of files
  allowedTypes?: string[];    // Allowed MIME types
  allowedExtensions?: string[]; // Allowed file extensions
  required?: boolean;         // Whether files are required
}

/**
 * Common validation schemas
 */
export const CommonSchemas = {
  // Pagination
  pagination: z.object({
    page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
    limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 25),
    sort: z.string().optional(),
    order: z.enum(['asc', 'desc']).optional()
  }),

  // ID parameter
  id: z.object({
    id: z.string().transform(val => parseInt(val, 10))
  }),

  // Search
  search: z.object({
    q: z.string().min(1).max(255).optional(),
    filter: z.string().optional()
  }),

  // Date range
  dateRange: z.object({
    start_date: z.string().datetime().optional(),
    end_date: z.string().datetime().optional()
  })
};

/**
 * Extend RequestContext type to include validated data
 */
declare module '../types' {
  interface RequestContext {
    validatedBody?: any;
    validatedQuery?: any;
    validatedParams?: any;
    validatedHeaders?: any;
    uploadedFiles?: File[];
    formData?: FormData;
    params?: Record<string, string>;
  }
}