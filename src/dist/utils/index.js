"use strict";
/**
 * Utility functions for the admin API
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimiter = void 0;
exports.isError = isError;
exports.getErrorMessage = getErrorMessage;
exports.formatErrorResponse = formatErrorResponse;
exports.sleep = sleep;
exports.generateId = generateId;
exports.sanitizeFilename = sanitizeFilename;
exports.formatBytes = formatBytes;
exports.calculatePercentage = calculatePercentage;
exports.isValidEmail = isValidEmail;
exports.isValidUrl = isValidUrl;
exports.deepClone = deepClone;
exports.removeUndefined = removeUndefined;
exports.chunkArray = chunkArray;
exports.retry = retry;
/**
 * Type guard to check if error is an Error instance
 */
function isError(error) {
    return error instanceof Error;
}
/**
 * Get error message from unknown error type
 */
function getErrorMessage(error) {
    if (isError(error)) {
        return error.message;
    }
    if (typeof error === 'string') {
        return error;
    }
    if (error && typeof error === 'object' && 'message' in error) {
        return String(error.message);
    }
    return 'Unknown error occurred';
}
/**
 * Format error for API response
 */
function formatErrorResponse(error, defaultMessage = 'An error occurred') {
    const message = getErrorMessage(error);
    return {
        error: 'Internal server error',
        message: message || defaultMessage
    };
}
/**
 * Sleep utility for testing/mocking
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
/**
 * Generate a random ID
 */
function generateId(prefix = 'id') {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
/**
 * Sanitize string for filename
 */
function sanitizeFilename(filename) {
    return filename.replace(/[^a-z0-9.-]/gi, '_').toLowerCase();
}
/**
 * Format bytes to human readable format
 */
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0)
        return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
/**
 * Calculate percentage
 */
function calculatePercentage(value, total) {
    if (total === 0)
        return 0;
    return Number(((value / total) * 100).toFixed(2));
}
/**
 * Validate email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
/**
 * Validate URL format
 */
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    }
    catch {
        return false;
    }
}
/**
 * Deep clone object
 */
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}
/**
 * Remove undefined values from object
 */
function removeUndefined(obj) {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
        if (value !== undefined) {
            result[key] = value;
        }
    }
    return result;
}
/**
 * Chunk array into smaller arrays
 */
function chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}
/**
 * Retry function with exponential backoff
 */
async function retry(fn, options = { maxAttempts: 3, delay: 1000, backoffFactor: 2 }) {
    let lastError;
    for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
        try {
            return await fn();
        }
        catch (error) {
            lastError = error;
            if (attempt === options.maxAttempts) {
                break;
            }
            const delay = options.delay * Math.pow(options.backoffFactor, attempt - 1);
            await sleep(delay);
        }
    }
    throw lastError;
}
/**
 * Rate limiter utility
 */
class RateLimiter {
    constructor(maxRequests, windowMs) {
        this.maxRequests = maxRequests;
        this.windowMs = windowMs;
        this.requests = new Map();
    }
    isAllowed(key) {
        const now = Date.now();
        const requests = this.requests.get(key) || [];
        // Remove old requests outside the window
        const validRequests = requests.filter(time => now - time < this.windowMs);
        if (validRequests.length >= this.maxRequests) {
            return false;
        }
        validRequests.push(now);
        this.requests.set(key, validRequests);
        return true;
    }
    reset(key) {
        this.requests.delete(key);
    }
    cleanup() {
        const now = Date.now();
        for (const [key, requests] of this.requests.entries()) {
            const validRequests = requests.filter(time => now - time < this.windowMs);
            if (validRequests.length === 0) {
                this.requests.delete(key);
            }
            else {
                this.requests.set(key, validRequests);
            }
        }
    }
}
exports.RateLimiter = RateLimiter;
//# sourceMappingURL=index.js.map