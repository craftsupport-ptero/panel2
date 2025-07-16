/**
 * Legacy Authentication Middleware
 * 
 * Handles authentication for legacy V1 API endpoints
 * Bridges between legacy API tokens and new serverless authentication
 */

import { Request, Response, NextFunction } from 'express';

interface LegacyApiKey {
    identifier: string;
    token: string;
    permissions: string[];
    last_used_at: string | null;
    created_at: string;
}

interface AuthenticatedUser {
    id: number;
    uuid: string;
    username: string;
    email: string;
    root_admin: boolean;
    api_key: LegacyApiKey;
}

declare global {
    namespace Express {
        interface Request {
            user?: AuthenticatedUser;
            apiKey?: LegacyApiKey;
        }
    }
}

class LegacyAuthService {
    /**
     * Validate legacy API key format
     */
    private isValidApiKeyFormat(token: string): boolean {
        // Legacy Pterodactyl API keys are typically 48 characters
        const legacyKeyRegex = /^ptla_[a-zA-Z0-9]{43}$/;
        const legacyApplicationKeyRegex = /^ptlc_[a-zA-Z0-9]{43}$/;
        
        return legacyKeyRegex.test(token) || legacyApplicationKeyRegex.test(token);
    }

    /**
     * Extract API key from Authorization header
     */
    private extractApiKey(authHeader: string): string | null {
        if (!authHeader) return null;
        
        // Support both "Bearer token" and "token" formats
        const bearerMatch = authHeader.match(/^Bearer\s+(.+)$/i);
        if (bearerMatch) {
            return bearerMatch[1];
        }
        
        // Direct token format
        if (this.isValidApiKeyFormat(authHeader)) {
            return authHeader;
        }
        
        return null;
    }

    /**
     * Validate API key against serverless authentication system
     */
    async validateApiKey(token: string): Promise<{ valid: boolean; user?: AuthenticatedUser; key?: LegacyApiKey }> {
        try {
            // In a real implementation, this would:
            // 1. Check if the token exists in the legacy API keys table
            // 2. Validate token hasn't expired
            // 3. Check rate limits
            // 4. Load associated user and permissions
            
            // For now, this is a placeholder implementation
            const isValid = await this.checkTokenInDatabase(token);
            
            if (!isValid) {
                return { valid: false };
            }
            
            const user = await this.getUserByApiKey(token);
            const keyDetails = await this.getApiKeyDetails(token);
            
            return {
                valid: true,
                user,
                key: keyDetails
            };
            
        } catch (error) {
            console.error('API key validation error:', error);
            return { valid: false };
        }
    }

    /**
     * Check if user has required permission
     */
    hasPermission(user: AuthenticatedUser, permission: string): boolean {
        // Root admin has all permissions
        if (user.root_admin) {
            return true;
        }
        
        // Check specific API key permissions
        return user.api_key.permissions.includes(permission) || 
               user.api_key.permissions.includes('*');
    }

    /**
     * Update API key last used timestamp
     */
    async updateLastUsed(token: string): Promise<void> {
        try {
            // Update last_used_at timestamp in database
            await this.updateApiKeyLastUsed(token);
        } catch (error) {
            console.error('Failed to update API key last used:', error);
        }
    }

    // Private helper methods (placeholders for actual implementations)
    private async checkTokenInDatabase(token: string): Promise<boolean> {
        // Implementation would check token in D1 database
        return true; // Placeholder
    }

    private async getUserByApiKey(token: string): Promise<AuthenticatedUser> {
        // Implementation would fetch user data from D1 database
        return {
            id: 1,
            uuid: 'user-uuid',
            username: 'admin',
            email: 'admin@example.com',
            root_admin: true,
            api_key: {
                identifier: 'key-identifier',
                token: token,
                permissions: ['*'],
                last_used_at: null,
                created_at: new Date().toISOString()
            }
        };
    }

    private async getApiKeyDetails(token: string): Promise<LegacyApiKey> {
        // Implementation would fetch API key details from D1 database
        return {
            identifier: 'key-identifier',
            token: token,
            permissions: ['*'],
            last_used_at: null,
            created_at: new Date().toISOString()
        };
    }

    private async updateApiKeyLastUsed(token: string): Promise<void> {
        // Implementation would update timestamp in D1 database
    }
}

const authService = new LegacyAuthService();

/**
 * Legacy Authentication Middleware
 */
export const LegacyAuthMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            res.status(401).json({
                errors: [{
                    code: 'InvalidCredentialsException',
                    status: '401',
                    detail: 'The credentials provided were invalid for this request.'
                }]
            });
            return;
        }

        const apiKey = authService.extractApiKey(authHeader);
        
        if (!apiKey) {
            res.status(401).json({
                errors: [{
                    code: 'InvalidCredentialsException',
                    status: '401',
                    detail: 'The credentials provided were invalid for this request.'
                }]
            });
            return;
        }

        const validation = await authService.validateApiKey(apiKey);
        
        if (!validation.valid || !validation.user) {
            res.status(401).json({
                errors: [{
                    code: 'InvalidCredentialsException',
                    status: '401',
                    detail: 'The credentials provided were invalid for this request.'
                }]
            });
            return;
        }

        // Attach user and API key to request
        req.user = validation.user;
        req.apiKey = validation.key;

        // Update last used timestamp (fire and forget)
        authService.updateLastUsed(apiKey).catch(console.error);

        next();
    } catch (error) {
        console.error('Authentication middleware error:', error);
        res.status(500).json({
            errors: [{
                code: 'InternalServerErrorException',
                status: '500',
                detail: 'An error occurred while processing the request.'
            }]
        });
    }
};

/**
 * Permission checking middleware factory
 */
export const requirePermission = (permission: string) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({
                errors: [{
                    code: 'UnauthorizedException',
                    status: '401',
                    detail: 'Access to this resource requires authentication.'
                }]
            });
            return;
        }

        if (!authService.hasPermission(req.user, permission)) {
            res.status(403).json({
                errors: [{
                    code: 'ForbiddenException',
                    status: '403',
                    detail: 'You do not have permission to access this resource.'
                }]
            });
            return;
        }

        next();
    };
};

/**
 * Rate limiting middleware for legacy API endpoints
 */
export const legacyRateLimit = (requestsPerMinute: number = 60) => {
    const requestCounts = new Map<string, { count: number; resetTime: number }>();

    return (req: Request, res: Response, next: NextFunction): void => {
        const identifier = req.user?.uuid || req.ip;
        const now = Date.now();
        const windowStart = Math.floor(now / 60000) * 60000; // Round to minute
        
        const current = requestCounts.get(identifier);
        
        if (!current || current.resetTime < windowStart) {
            requestCounts.set(identifier, {
                count: 1,
                resetTime: windowStart + 60000
            });
        } else {
            current.count++;
            
            if (current.count > requestsPerMinute) {
                res.status(429).json({
                    errors: [{
                        code: 'TooManyRequestsException',
                        status: '429',
                        detail: 'Too many requests. Please try again later.'
                    }]
                });
                return;
            }
        }

        // Clean up old entries
        if (Math.random() < 0.1) { // 10% chance to clean up
            for (const [key, value] of requestCounts.entries()) {
                if (value.resetTime < now) {
                    requestCounts.delete(key);
                }
            }
        }

        next();
    };
};

export { authService as LegacyAuthService };