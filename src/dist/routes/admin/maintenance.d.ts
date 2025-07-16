import { Request, Response } from 'express';
/**
 * Get system maintenance status
 * GET /api/admin/maintenance/status
 */
export declare function getMaintenanceStatus(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Run cleanup tasks
 * POST /api/admin/maintenance/cleanup
 */
export declare function runCleanupTasks(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Optimize database
 * POST /api/admin/maintenance/optimize
 */
export declare function optimizeDatabase(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Get system maintenance logs
 * GET /api/admin/maintenance/logs
 */
export declare function getMaintenanceLogs(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Create system backup
 * POST /api/admin/maintenance/backup
 */
export declare function createSystemBackup(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Run database migrations
 * POST /api/admin/maintenance/migrate
 */
export declare function runDatabaseMigrations(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=maintenance.d.ts.map