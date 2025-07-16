/**
 * Legacy V1 API Compatibility Layer - Servers
 * 
 * Maintains compatibility with existing Pterodactyl V1 API endpoints
 * Transforms requests/responses to work with new serverless architecture
 */

import { Router, Request, Response, NextFunction } from 'express';
import { LegacyAuthMiddleware } from '../middleware/auth';
import { ResponseTransformer } from '../transformers/responses';

interface LegacyServerRequest {
    name: string;
    user: number;
    egg: number;
    docker_image: string;
    startup: string;
    environment: Record<string, string>;
    limits: {
        memory: number;
        swap: number;
        disk: number;
        io: number;
        cpu: number;
    };
    feature_limits: {
        databases: number;
        backups: number;
        allocations: number;
    };
    allocation: {
        default: number;
        additional?: number[];
    };
}

interface LegacyServerResponse {
    object: string;
    attributes: {
        id: number;
        external_id: string | null;
        uuid: string;
        identifier: string;
        name: string;
        description: string;
        status: string;
        suspended: boolean;
        limits: {
            memory: number;
            swap: number;
            disk: number;
            io: number;
            cpu: number;
        };
        feature_limits: {
            databases: number;
            backups: number;
            allocations: number;
        };
        user: number;
        node: number;
        allocation: number;
        nest: number;
        egg: number;
        container: {
            startup_command: string;
            image: string;
            installed: boolean;
            environment: Record<string, string>;
        };
        created_at: string;
        updated_at: string;
    };
}

class LegacyServersController {
    private responseTransformer: ResponseTransformer;

    constructor() {
        this.responseTransformer = new ResponseTransformer();
    }

    /**
     * List all servers
     * GET /api/application/servers
     */
    async index(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // Extract legacy query parameters
            const page = parseInt(req.query.page as string) || 1;
            const perPage = parseInt(req.query.per_page as string) || 50;
            const include = req.query.include as string;
            const filter = req.query.filter as string;

            // Map to new serverless API call
            const serverlessResponse = await this.fetchServersFromServerless({
                page,
                perPage,
                include: include?.split(','),
                filter: this.parseFilter(filter)
            });

            // Transform response to legacy format
            const legacyResponse = this.responseTransformer.transformServersList(serverlessResponse);

            res.json(legacyResponse);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get server details
     * GET /api/application/servers/{id}
     */
    async show(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const serverId = req.params.id;
            const include = req.query.include as string;

            // Fetch from serverless API
            const serverlessResponse = await this.fetchServerFromServerless(serverId, {
                include: include?.split(',')
            });

            // Transform to legacy format
            const legacyResponse = this.responseTransformer.transformServer(serverlessResponse);

            res.json(legacyResponse);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Create new server
     * POST /api/application/servers
     */
    async store(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const legacyRequest: LegacyServerRequest = req.body;

            // Transform legacy request to serverless format
            const serverlessRequest = this.transformCreateRequest(legacyRequest);

            // Create server via serverless API
            const serverlessResponse = await this.createServerInServerless(serverlessRequest);

            // Transform response to legacy format
            const legacyResponse = this.responseTransformer.transformServer(serverlessResponse);

            res.status(201).json(legacyResponse);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update server
     * PATCH /api/application/servers/{id}
     */
    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const serverId = req.params.id;
            const legacyRequest = req.body;

            // Transform legacy update request
            const serverlessRequest = this.transformUpdateRequest(legacyRequest);

            // Update server via serverless API
            const serverlessResponse = await this.updateServerInServerless(serverId, serverlessRequest);

            // Transform response to legacy format
            const legacyResponse = this.responseTransformer.transformServer(serverlessResponse);

            res.json(legacyResponse);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete server
     * DELETE /api/application/servers/{id}
     */
    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const serverId = req.params.id;
            const force = req.query.force === 'true';

            // Delete server via serverless API
            await this.deleteServerInServerless(serverId, { force });

            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }

    /**
     * Suspend server
     * POST /api/application/servers/{id}/suspend
     */
    async suspend(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const serverId = req.params.id;

            // Suspend server via serverless API
            const serverlessResponse = await this.suspendServerInServerless(serverId);

            // Transform response to legacy format
            const legacyResponse = this.responseTransformer.transformServer(serverlessResponse);

            res.json(legacyResponse);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Unsuspend server
     * POST /api/application/servers/{id}/unsuspend
     */
    async unsuspend(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const serverId = req.params.id;

            // Unsuspend server via serverless API
            const serverlessResponse = await this.unsuspendServerInServerless(serverId);

            // Transform response to legacy format
            const legacyResponse = this.responseTransformer.transformServer(serverlessResponse);

            res.json(legacyResponse);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Reinstall server
     * POST /api/application/servers/{id}/reinstall
     */
    async reinstall(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const serverId = req.params.id;

            // Reinstall server via serverless API
            const serverlessResponse = await this.reinstallServerInServerless(serverId);

            // Transform response to legacy format
            const legacyResponse = this.responseTransformer.transformServer(serverlessResponse);

            res.json(legacyResponse);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Rebuild server
     * POST /api/application/servers/{id}/rebuild
     */
    async rebuild(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const serverId = req.params.id;

            // Rebuild server via serverless API
            const serverlessResponse = await this.rebuildServerInServerless(serverId);

            // Transform response to legacy format
            const legacyResponse = this.responseTransformer.transformServer(serverlessResponse);

            res.json(legacyResponse);
        } catch (error) {
            next(error);
        }
    }

    // Private helper methods for serverless API communication
    private async fetchServersFromServerless(params: any): Promise<any> {
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

    private async fetchServerFromServerless(serverId: string, options: any): Promise<any> {
        // Implementation would call the new serverless API
        return {
            id: serverId,
            // ... other server data
        };
    }

    private async createServerInServerless(data: any): Promise<any> {
        // Implementation would call the new serverless API
        return {
            id: 'new-server-id',
            // ... other server data
        };
    }

    private async updateServerInServerless(serverId: string, data: any): Promise<any> {
        // Implementation would call the new serverless API
        return {
            id: serverId,
            // ... updated server data
        };
    }

    private async deleteServerInServerless(serverId: string, options: any): Promise<void> {
        // Implementation would call the new serverless API
    }

    private async suspendServerInServerless(serverId: string): Promise<any> {
        // Implementation would call the new serverless API
        return {
            id: serverId,
            suspended: true
        };
    }

    private async unsuspendServerInServerless(serverId: string): Promise<any> {
        // Implementation would call the new serverless API
        return {
            id: serverId,
            suspended: false
        };
    }

    private async reinstallServerInServerless(serverId: string): Promise<any> {
        // Implementation would call the new serverless API
        return {
            id: serverId,
            status: 'installing'
        };
    }

    private async rebuildServerInServerless(serverId: string): Promise<any> {
        // Implementation would call the new serverless API
        return {
            id: serverId,
            status: 'installing'
        };
    }

    private transformCreateRequest(legacyRequest: LegacyServerRequest): any {
        // Transform legacy create request format to serverless format
        return {
            name: legacyRequest.name,
            owner_id: legacyRequest.user,
            egg_id: legacyRequest.egg,
            docker_image: legacyRequest.docker_image,
            startup: legacyRequest.startup,
            environment: legacyRequest.environment,
            limits: legacyRequest.limits,
            feature_limits: legacyRequest.feature_limits,
            allocation: legacyRequest.allocation
        };
    }

    private transformUpdateRequest(legacyRequest: any): any {
        // Transform legacy update request format to serverless format
        return {
            ...legacyRequest
        };
    }

    private parseFilter(filter: string | undefined): any {
        if (!filter) return {};

        // Parse legacy filter format
        const filters: any = {};
        
        // Example: "name:*test*,user:1"
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
}

// Router setup
const router = Router();
const controller = new LegacyServersController();

// Apply legacy authentication middleware
router.use(LegacyAuthMiddleware);

// Server routes
router.get('/', controller.index.bind(controller));
router.get('/:id', controller.show.bind(controller));
router.post('/', controller.store.bind(controller));
router.patch('/:id', controller.update.bind(controller));
router.delete('/:id', controller.delete.bind(controller));

// Server action routes
router.post('/:id/suspend', controller.suspend.bind(controller));
router.post('/:id/unsuspend', controller.unsuspend.bind(controller));
router.post('/:id/reinstall', controller.reinstall.bind(controller));
router.post('/:id/rebuild', controller.rebuild.bind(controller));

export { router as LegacyServersRouter };