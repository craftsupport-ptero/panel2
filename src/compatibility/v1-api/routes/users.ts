/**
 * Legacy V1 API Compatibility Layer - Users
 * 
 * Maintains compatibility with existing Pterodactyl V1 API endpoints for user management
 * Transforms requests/responses to work with new serverless architecture
 */

import { Router, Request, Response, NextFunction } from 'express';
import { LegacyAuthMiddleware } from '../middleware/auth';
import { ResponseTransformer } from '../transformers/responses';

interface LegacyUserRequest {
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    password?: string;
    root_admin?: boolean;
    language?: string;
    external_id?: string;
}

interface LegacyUserResponse {
    object: string;
    attributes: {
        id: number;
        external_id: string | null;
        uuid: string;
        username: string;
        email: string;
        first_name: string;
        last_name: string;
        language: string;
        root_admin: boolean;
        '2fa': boolean;
        avatar_url: string;
        admin_role_id: number | null;
        created_at: string;
        updated_at: string;
    };
}

class LegacyUsersController {
    private responseTransformer: ResponseTransformer;

    constructor() {
        this.responseTransformer = new ResponseTransformer();
    }

    /**
     * List all users
     * GET /api/application/users
     */
    async index(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // Extract legacy query parameters
            const page = parseInt(req.query.page as string) || 1;
            const perPage = parseInt(req.query.per_page as string) || 50;
            const include = req.query.include as string;
            const filter = req.query.filter as string;
            const sort = req.query.sort as string;

            // Map to new serverless API call
            const serverlessResponse = await this.fetchUsersFromServerless({
                page,
                perPage,
                include: include?.split(','),
                filter: this.parseFilter(filter),
                sort: this.parseSort(sort)
            });

            // Transform response to legacy format
            const legacyResponse = this.responseTransformer.transformUsersList(serverlessResponse);

            res.json(legacyResponse);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get user details
     * GET /api/application/users/{id}
     */
    async show(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.params.id;
            const include = req.query.include as string;

            // Fetch from serverless API
            const serverlessResponse = await this.fetchUserFromServerless(userId, {
                include: include?.split(',')
            });

            // Transform to legacy format
            const legacyResponse = this.responseTransformer.transformUser(serverlessResponse);

            res.json(legacyResponse);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get user by external ID
     * GET /api/application/users/external/{external_id}
     */
    async showByExternal(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const externalId = req.params.external_id;
            const include = req.query.include as string;

            // Fetch from serverless API by external ID
            const serverlessResponse = await this.fetchUserByExternalIdFromServerless(externalId, {
                include: include?.split(',')
            });

            // Transform to legacy format
            const legacyResponse = this.responseTransformer.transformUser(serverlessResponse);

            res.json(legacyResponse);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Create new user
     * POST /api/application/users
     */
    async store(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const legacyRequest: LegacyUserRequest = req.body;

            // Validate required fields
            this.validateCreateRequest(legacyRequest);

            // Transform legacy request to serverless format
            const serverlessRequest = this.transformCreateRequest(legacyRequest);

            // Create user via serverless API
            const serverlessResponse = await this.createUserInServerless(serverlessRequest);

            // Transform response to legacy format
            const legacyResponse = this.responseTransformer.transformUser(serverlessResponse);

            res.status(201).json(legacyResponse);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update user
     * PATCH /api/application/users/{id}
     */
    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.params.id;
            const legacyRequest = req.body;

            // Transform legacy update request
            const serverlessRequest = this.transformUpdateRequest(legacyRequest);

            // Update user via serverless API
            const serverlessResponse = await this.updateUserInServerless(userId, serverlessRequest);

            // Transform response to legacy format
            const legacyResponse = this.responseTransformer.transformUser(serverlessResponse);

            res.json(legacyResponse);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete user
     * DELETE /api/application/users/{id}
     */
    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.params.id;

            // Check if user can be deleted (no active servers, etc.)
            await this.validateUserDeletion(userId);

            // Delete user via serverless API
            await this.deleteUserInServerless(userId);

            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }

    // Private helper methods for serverless API communication
    private async fetchUsersFromServerless(params: any): Promise<any> {
        // Implementation would call the new serverless API
        // This is a placeholder for the actual serverless API call
        return {
            data: [],
            meta: {
                pagination: {
                    total: 0,
                    count: 0,
                    per_page: params.perPage,
                    current_page: params.page,
                    total_pages: 0
                }
            }
        };
    }

    private async fetchUserFromServerless(userId: string, options: any): Promise<any> {
        // Implementation would call the new serverless API
        return {
            id: userId,
            // ... other user data
        };
    }

    private async fetchUserByExternalIdFromServerless(externalId: string, options: any): Promise<any> {
        // Implementation would call the new serverless API
        return {
            external_id: externalId,
            // ... other user data
        };
    }

    private async createUserInServerless(data: any): Promise<any> {
        // Implementation would call the new serverless API
        return {
            id: 'new-user-id',
            // ... other user data
        };
    }

    private async updateUserInServerless(userId: string, data: any): Promise<any> {
        // Implementation would call the new serverless API
        return {
            id: userId,
            // ... updated user data
        };
    }

    private async deleteUserInServerless(userId: string): Promise<void> {
        // Implementation would call the new serverless API
    }

    private validateCreateRequest(request: LegacyUserRequest): void {
        const errors: string[] = [];

        if (!request.email) {
            errors.push('Email is required');
        } else if (!this.isValidEmail(request.email)) {
            errors.push('Email must be a valid email address');
        }

        if (!request.username) {
            errors.push('Username is required');
        } else if (request.username.length < 3) {
            errors.push('Username must be at least 3 characters');
        }

        if (!request.first_name) {
            errors.push('First name is required');
        }

        if (!request.last_name) {
            errors.push('Last name is required');
        }

        if (request.password && request.password.length < 8) {
            errors.push('Password must be at least 8 characters');
        }

        if (errors.length > 0) {
            throw new Error(`Validation failed: ${errors.join(', ')}`);
        }
    }

    private async validateUserDeletion(userId: string): Promise<void> {
        // Check if user has active servers
        const userServers = await this.getUserServers(userId);
        
        if (userServers.length > 0) {
            throw new Error('Cannot delete user with active servers');
        }

        // Check if user has pending transactions, etc.
        // Additional validation logic would go here
    }

    private async getUserServers(userId: string): Promise<any[]> {
        // Implementation would fetch user's servers from serverless API
        return [];
    }

    private transformCreateRequest(legacyRequest: LegacyUserRequest): any {
        // Transform legacy create request format to serverless format
        return {
            email: legacyRequest.email,
            username: legacyRequest.username,
            first_name: legacyRequest.first_name,
            last_name: legacyRequest.last_name,
            password: legacyRequest.password,
            root_admin: legacyRequest.root_admin || false,
            language: legacyRequest.language || 'en',
            external_id: legacyRequest.external_id || null
        };
    }

    private transformUpdateRequest(legacyRequest: any): any {
        // Transform legacy update request format to serverless format
        const serverlessRequest: any = {};

        // Only include fields that are present in the request
        if (legacyRequest.email !== undefined) {
            serverlessRequest.email = legacyRequest.email;
        }
        if (legacyRequest.username !== undefined) {
            serverlessRequest.username = legacyRequest.username;
        }
        if (legacyRequest.first_name !== undefined) {
            serverlessRequest.first_name = legacyRequest.first_name;
        }
        if (legacyRequest.last_name !== undefined) {
            serverlessRequest.last_name = legacyRequest.last_name;
        }
        if (legacyRequest.password !== undefined) {
            serverlessRequest.password = legacyRequest.password;
        }
        if (legacyRequest.root_admin !== undefined) {
            serverlessRequest.root_admin = legacyRequest.root_admin;
        }
        if (legacyRequest.language !== undefined) {
            serverlessRequest.language = legacyRequest.language;
        }
        if (legacyRequest.external_id !== undefined) {
            serverlessRequest.external_id = legacyRequest.external_id;
        }

        return serverlessRequest;
    }

    private parseFilter(filter: string | undefined): any {
        if (!filter) return {};

        const filters: any = {};
        
        // Example: "email:*@example.com,username:admin*"
        if (filter) {
            const filterPairs = filter.split(',');
            for (const pair of filterPairs) {
                const [key, value] = pair.split(':');
                if (key && value) {
                    filters[key] = value;
                }
            }
        }

        return filters;
    }

    private parseSort(sort: string | undefined): any {
        if (!sort) return {};

        // Example: "-created_at,username"
        const sortFields: any = {};
        
        if (sort) {
            const fields = sort.split(',');
            for (const field of fields) {
                if (field.startsWith('-')) {
                    sortFields[field.substring(1)] = 'desc';
                } else {
                    sortFields[field] = 'asc';
                }
            }
        }

        return sortFields;
    }

    private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}

// Router setup
const router = Router();
const controller = new LegacyUsersController();

// Apply legacy authentication middleware
router.use(LegacyAuthMiddleware);

// User routes
router.get('/', controller.index.bind(controller));
router.get('/:id', controller.show.bind(controller));
router.get('/external/:external_id', controller.showByExternal.bind(controller));
router.post('/', controller.store.bind(controller));
router.patch('/:id', controller.update.bind(controller));
router.delete('/:id', controller.delete.bind(controller));

export { router as LegacyUsersRouter };