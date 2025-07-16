import { Request, Response } from 'express';
/**
 * Get node overview and health status
 * GET /api/admin/nodes/overview
 */
export declare function getNodeOverview(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Set node maintenance mode
 * POST /api/admin/nodes/maintenance
 */
export declare function setNodeMaintenance(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Drain servers from a node
 * POST /api/admin/nodes/drain
 */
export declare function drainNode(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Get capacity planning data
 * GET /api/admin/nodes/capacity
 */
export declare function getCapacityPlanning(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Optimize node allocation
 * POST /api/admin/nodes/optimize
 */
export declare function optimizeNodeAllocation(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=nodes.d.ts.map