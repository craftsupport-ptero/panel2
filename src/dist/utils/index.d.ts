/**
 * Utility functions for the admin API
 */
/**
 * Type guard to check if error is an Error instance
 */
export declare function isError(error: unknown): error is Error;
/**
 * Get error message from unknown error type
 */
export declare function getErrorMessage(error: unknown): string;
/**
 * Format error for API response
 */
export declare function formatErrorResponse(error: unknown, defaultMessage?: string): {
    error: string;
    message: string;
};
/**
 * Sleep utility for testing/mocking
 */
export declare function sleep(ms: number): Promise<void>;
/**
 * Generate a random ID
 */
export declare function generateId(prefix?: string): string;
/**
 * Sanitize string for filename
 */
export declare function sanitizeFilename(filename: string): string;
/**
 * Format bytes to human readable format
 */
export declare function formatBytes(bytes: number, decimals?: number): string;
/**
 * Calculate percentage
 */
export declare function calculatePercentage(value: number, total: number): number;
/**
 * Validate email format
 */
export declare function isValidEmail(email: string): boolean;
/**
 * Validate URL format
 */
export declare function isValidUrl(url: string): boolean;
/**
 * Deep clone object
 */
export declare function deepClone<T>(obj: T): T;
/**
 * Remove undefined values from object
 */
export declare function removeUndefined<T extends Record<string, any>>(obj: T): Partial<T>;
/**
 * Chunk array into smaller arrays
 */
export declare function chunkArray<T>(array: T[], size: number): T[][];
/**
 * Retry function with exponential backoff
 */
export declare function retry<T>(fn: () => Promise<T>, options?: {
    maxAttempts: number;
    delay: number;
    backoffFactor: number;
}): Promise<T>;
/**
 * Rate limiter utility
 */
export declare class RateLimiter {
    private maxRequests;
    private windowMs;
    private requests;
    constructor(maxRequests: number, windowMs: number);
    isAllowed(key: string): boolean;
    reset(key: string): void;
    cleanup(): void;
}
//# sourceMappingURL=index.d.ts.map