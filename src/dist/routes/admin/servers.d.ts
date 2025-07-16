import { Request, Response } from 'express';
/**
 * Get server overview and statistics
 * GET /api/admin/servers/overview
 */
export declare function getServerOverview(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Execute bulk server operations
 * POST /api/admin/servers/bulk-action
 */
export declare function bulkServerAction(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Migrate server between nodes
 * POST /api/admin/servers/migrate
 */
export declare function migrateServer(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Get resource optimization suggestions
 * GET /api/admin/servers/optimization
 */
export declare function getOptimizationSuggestions(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Backup all servers
 * POST /api/admin/servers/backup-all
 */
export declare function backupAllServers(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Get server performance analysis
 * GET /api/admin/servers/performance
 */
export declare function getPerformanceAnalysis(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=servers.d.ts.map