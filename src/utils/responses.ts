import type { ApiResponse, ErrorResponse, RateLimit } from '../types';

/**
 * Standardized API response utilities
 */

/**
 * Create a successful response
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  meta?: {
    pagination?: {
      page: number;
      perPage: number;
      total: number;
      totalPages: number;
    };
    rateLimit?: RateLimit;
    [key: string]: any;
  }
): Response {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
    meta
  };

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

/**
 * Create an error response
 */
export function createErrorResponse(
  message: string,
  statusCode: number = 500,
  code?: string,
  details?: any
): Response {
  const response: ErrorResponse = {
    success: false,
    error: code || getErrorCodeFromStatus(statusCode),
    message,
    code,
    details
  };

  return new Response(JSON.stringify(response), {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

/**
 * Create a paginated response
 */
export function createPaginatedResponse<T>(
  data: T[],
  pagination: {
    page: number;
    perPage: number;
    total: number;
  },
  message?: string
): Response {
  const totalPages = Math.ceil(pagination.total / pagination.perPage);
  
  return createSuccessResponse(data, message, {
    pagination: {
      ...pagination,
      totalPages
    }
  });
}

/**
 * Create a response with no content
 */
export function createNoContentResponse(): Response {
  return new Response(null, {
    status: 204
  });
}

/**
 * Create a created response (201)
 */
export function createCreatedResponse<T>(data: T, message?: string): Response {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message: message || 'Resource created successfully'
  };

  return new Response(JSON.stringify(response), {
    status: 201,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

/**
 * Create an accepted response (202)
 */
export function createAcceptedResponse<T>(data?: T, message?: string): Response {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message: message || 'Request accepted for processing'
  };

  return new Response(JSON.stringify(response), {
    status: 202,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

/**
 * Create a redirect response
 */
export function createRedirectResponse(url: string, permanent: boolean = false): Response {
  return Response.redirect(url, permanent ? 301 : 302);
}

/**
 * Create a file download response
 */
export function createFileResponse(
  file: Uint8Array | string,
  filename: string,
  contentType: string = 'application/octet-stream'
): Response {
  const headers = new Headers({
    'Content-Type': contentType,
    'Content-Disposition': `attachment; filename="${filename}"`,
    'Cache-Control': 'no-cache'
  });

  return new Response(file, {
    status: 200,
    headers
  });
}

/**
 * Create a streaming response
 */
export function createStreamResponse(
  stream: ReadableStream,
  contentType: string = 'application/octet-stream'
): Response {
  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache'
    }
  });
}

/**
 * Add CORS headers to any response
 */
export function addCorsHeaders(response: Response, origin?: string): Response {
  const headers = new Headers(response.headers);
  
  headers.set('Access-Control-Allow-Origin', origin || '*');
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

/**
 * Add cache headers to response
 */
export function addCacheHeaders(
  response: Response,
  maxAge: number = 3600,
  isPublic: boolean = true
): Response {
  const headers = new Headers(response.headers);
  
  const cacheControl = isPublic 
    ? `public, max-age=${maxAge}` 
    : `private, max-age=${maxAge}`;
  
  headers.set('Cache-Control', cacheControl);
  headers.set('ETag', generateETag(response));
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

/**
 * Add security headers to response
 */
export function addSecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('X-XSS-Protection', '1; mode=block');
  headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Content-Security-Policy', "default-src 'self'");
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

/**
 * Transform response data before sending
 */
export function transformResponse<T, U>(
  response: Response,
  transformer: (data: T) => U
): Promise<Response> {
  return response.json().then(data => {
    const transformed = transformer(data);
    return new Response(JSON.stringify(transformed), {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    });
  });
}

/**
 * Get error code from HTTP status code
 */
function getErrorCodeFromStatus(statusCode: number): string {
  const statusCodeMap: Record<number, string> = {
    400: 'BAD_REQUEST',
    401: 'UNAUTHORIZED',
    403: 'FORBIDDEN',
    404: 'NOT_FOUND',
    405: 'METHOD_NOT_ALLOWED',
    409: 'CONFLICT',
    422: 'UNPROCESSABLE_ENTITY',
    429: 'RATE_LIMIT_EXCEEDED',
    500: 'INTERNAL_SERVER_ERROR',
    502: 'BAD_GATEWAY',
    503: 'SERVICE_UNAVAILABLE',
    504: 'GATEWAY_TIMEOUT'
  };

  return statusCodeMap[statusCode] || 'UNKNOWN_ERROR';
}

/**
 * Generate ETag for response caching
 */
function generateETag(response: Response): string {
  // Simple ETag generation based on content
  const content = response.body || '';
  const hash = simpleHash(content.toString());
  return `"${hash}"`;
}

/**
 * Simple hash function for ETag generation
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
}

/**
 * Check if response is successful (2xx status)
 */
export function isSuccessResponse(response: Response): boolean {
  return response.status >= 200 && response.status < 300;
}

/**
 * Check if response is a client error (4xx status)
 */
export function isClientError(response: Response): boolean {
  return response.status >= 400 && response.status < 500;
}

/**
 * Check if response is a server error (5xx status)
 */
export function isServerError(response: Response): boolean {
  return response.status >= 500 && response.status < 600;
}

/**
 * Extract JSON data from response safely
 */
export async function safeJsonParse<T>(response: Response): Promise<T | null> {
  try {
    const text = await response.text();
    if (!text) return null;
    return JSON.parse(text) as T;
  } catch (error) {
    console.error('Failed to parse JSON response:', error);
    return null;
  }
}

/**
 * Response building utility class
 */
export class ResponseBuilder {
  private status: number = 200;
  private headers: Headers = new Headers();
  private body: any = null;

  setStatus(status: number): ResponseBuilder {
    this.status = status;
    return this;
  }

  setHeader(name: string, value: string): ResponseBuilder {
    this.headers.set(name, value);
    return this;
  }

  setHeaders(headers: Record<string, string>): ResponseBuilder {
    Object.entries(headers).forEach(([name, value]) => {
      this.headers.set(name, value);
    });
    return this;
  }

  setJson(data: any): ResponseBuilder {
    this.body = JSON.stringify(data);
    this.headers.set('Content-Type', 'application/json');
    return this;
  }

  setText(text: string): ResponseBuilder {
    this.body = text;
    this.headers.set('Content-Type', 'text/plain');
    return this;
  }

  setHtml(html: string): ResponseBuilder {
    this.body = html;
    this.headers.set('Content-Type', 'text/html');
    return this;
  }

  build(): Response {
    return new Response(this.body, {
      status: this.status,
      headers: this.headers
    });
  }
}