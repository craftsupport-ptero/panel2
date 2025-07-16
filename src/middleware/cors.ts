import type { RequestContext } from '../types';

/**
 * CORS middleware for handling cross-origin requests
 */
export class CorsMiddleware {
  private allowedOrigins: string[];
  private allowedMethods: string[];
  private allowedHeaders: string[];
  private exposedHeaders: string[];
  private allowCredentials: boolean;
  private maxAge: number;

  constructor(options: CorsOptions = {}) {
    this.allowedOrigins = options.origins || ['*'];
    this.allowedMethods = options.methods || ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'];
    this.allowedHeaders = options.headers || [
      'Content-Type',
      'Authorization',
      'X-API-Key',
      'X-Requested-With',
      'Accept',
      'Origin'
    ];
    this.exposedHeaders = options.exposedHeaders || [
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset',
      'X-Total-Count'
    ];
    this.allowCredentials = options.credentials !== false;
    this.maxAge = options.maxAge || 86400; // 24 hours
  }

  /**
   * Handle CORS for incoming requests
   */
  async handle(request: Request, context: RequestContext): Promise<Response | null> {
    const origin = request.headers.get('origin');
    
    // Handle preflight OPTIONS requests
    if (request.method === 'OPTIONS') {
      return this.handlePreflight(request, origin);
    }

    // For non-preflight requests, just add headers and continue
    return null;
  }

  /**
   * Add CORS headers to response
   */
  addCorsHeaders(response: Response, origin?: string | null): Response {
    const headers = new Headers(response.headers);
    
    // Set allowed origin
    if (this.isOriginAllowed(origin)) {
      headers.set('Access-Control-Allow-Origin', origin || '*');
    } else if (this.allowedOrigins.includes('*')) {
      headers.set('Access-Control-Allow-Origin', '*');
    }

    // Set other CORS headers
    if (this.allowCredentials && origin && origin !== '*') {
      headers.set('Access-Control-Allow-Credentials', 'true');
    }

    if (this.exposedHeaders.length > 0) {
      headers.set('Access-Control-Expose-Headers', this.exposedHeaders.join(', '));
    }

    // Add security headers
    this.addSecurityHeaders(headers);

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }

  /**
   * Handle preflight OPTIONS requests
   */
  private handlePreflight(request: Request, origin?: string | null): Response {
    const headers = new Headers();

    // Check if origin is allowed
    if (!this.isOriginAllowed(origin)) {
      return new Response(null, { status: 403 });
    }

    // Set CORS headers
    headers.set('Access-Control-Allow-Origin', origin || '*');
    headers.set('Access-Control-Allow-Methods', this.allowedMethods.join(', '));
    headers.set('Access-Control-Allow-Headers', this.allowedHeaders.join(', '));
    headers.set('Access-Control-Max-Age', this.maxAge.toString());

    if (this.allowCredentials && origin && origin !== '*') {
      headers.set('Access-Control-Allow-Credentials', 'true');
    }

    // Add security headers
    this.addSecurityHeaders(headers);

    return new Response(null, {
      status: 204,
      headers
    });
  }

  /**
   * Check if origin is allowed
   */
  private isOriginAllowed(origin?: string | null): boolean {
    if (!origin) return true; // Allow requests without origin header
    
    if (this.allowedOrigins.includes('*')) return true;
    
    return this.allowedOrigins.some(allowedOrigin => {
      // Exact match
      if (allowedOrigin === origin) return true;
      
      // Wildcard subdomain match (e.g., *.example.com)
      if (allowedOrigin.startsWith('*.')) {
        const domain = allowedOrigin.substring(2);
        return origin.endsWith('.' + domain) || origin === domain;
      }
      
      return false;
    });
  }

  /**
   * Add security headers to response
   */
  private addSecurityHeaders(headers: Headers): void {
    // Prevent MIME type sniffing
    headers.set('X-Content-Type-Options', 'nosniff');
    
    // Prevent clickjacking
    headers.set('X-Frame-Options', 'DENY');
    
    // XSS protection
    headers.set('X-XSS-Protection', '1; mode=block');
    
    // HSTS for HTTPS
    headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    
    // Content Security Policy
    headers.set('Content-Security-Policy', 
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: https:; " +
      "font-src 'self' data:; " +
      "connect-src 'self'; " +
      "frame-ancestors 'none'"
    );
    
    // Referrer policy
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Permissions policy
    headers.set('Permissions-Policy', 
      'camera=(), microphone=(), geolocation=(), payment=()'
    );
  }
}

/**
 * CORS configuration options
 */
export interface CorsOptions {
  origins?: string[];
  methods?: string[];
  headers?: string[];
  exposedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
}

/**
 * Predefined CORS configurations
 */
export const CORS_CONFIGS = {
  // Development configuration - allow localhost
  DEVELOPMENT: {
    origins: [
      'http://localhost:3000',
      'http://localhost:8080',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:8080'
    ],
    credentials: true
  },
  
  // Production configuration - restrictive
  PRODUCTION: {
    origins: [], // Should be set via environment variables
    credentials: true
  },
  
  // Public API configuration - open but secure
  PUBLIC_API: {
    origins: ['*'],
    credentials: false,
    exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining']
  }
} as const;

/**
 * Create CORS middleware with environment-specific configuration
 */
export function createCorsMiddleware(environment: string = 'development'): CorsMiddleware {
  let config: CorsOptions;
  
  switch (environment) {
    case 'production':
      config = CORS_CONFIGS.PRODUCTION;
      break;
    case 'development':
      config = CORS_CONFIGS.DEVELOPMENT;
      break;
    default:
      config = CORS_CONFIGS.DEVELOPMENT;
  }
  
  return new CorsMiddleware(config);
}