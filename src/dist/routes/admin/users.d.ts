import { Request, Response } from 'express';
/**
 * Advanced user search with filtering and pagination
 * GET /api/admin/users/search
 */
export declare function searchUsers(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Bulk create users
 * POST /api/admin/users/bulk-create
 */
export declare function bulkCreateUsers(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Bulk update users
 * PUT /api/admin/users/bulk-update
 */
export declare function bulkUpdateUsers(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Bulk delete users
 * POST /api/admin/users/bulk-delete
 */
export declare function bulkDeleteUsers(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Get user activity overview
 * GET /api/admin/users/activity
 */
export declare function getUserActivity(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Export user data
 * POST /api/admin/users/export
 */
export declare function exportUsers(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Import user data from CSV
 * POST /api/admin/users/import
 */
export declare function importUsers(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=users.d.ts.map