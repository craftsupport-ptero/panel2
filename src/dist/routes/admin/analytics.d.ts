import { Request, Response } from 'express';
/**
 * Get user analytics and trends
 * GET /api/admin/analytics/users
 */
export declare function getUserAnalytics(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Get server usage analytics
 * GET /api/admin/analytics/servers
 */
export declare function getServerAnalytics(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Get resource utilization reports
 * GET /api/admin/analytics/resources
 */
export declare function getResourceAnalytics(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Get system performance metrics
 * GET /api/admin/analytics/performance
 */
export declare function getPerformanceMetrics(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Export analytics data
 * POST /api/admin/analytics/export
 */
export declare function exportAnalytics(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=analytics.d.ts.map