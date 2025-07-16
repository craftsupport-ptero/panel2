import { Request, Response } from 'express';
import { z } from 'zod';
declare const DashboardStatsSchema: z.ZodObject<{
    system: z.ZodObject<{
        uptime: z.ZodNumber;
        version: z.ZodString;
        status: z.ZodEnum<["healthy", "warning", "critical"]>;
    }, "strip", z.ZodTypeAny, {
        status: "healthy" | "warning" | "critical";
        uptime: number;
        version: string;
    }, {
        status: "healthy" | "warning" | "critical";
        uptime: number;
        version: string;
    }>;
    statistics: z.ZodObject<{
        users: z.ZodObject<{
            total: z.ZodNumber;
            active_today: z.ZodNumber;
            new_this_week: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            total: number;
            active_today: number;
            new_this_week: number;
        }, {
            total: number;
            active_today: number;
            new_this_week: number;
        }>;
        servers: z.ZodObject<{
            total: z.ZodNumber;
            running: z.ZodNumber;
            stopped: z.ZodNumber;
            installing: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            total: number;
            running: number;
            stopped: number;
            installing: number;
        }, {
            total: number;
            running: number;
            stopped: number;
            installing: number;
        }>;
        resources: z.ZodObject<{
            total_memory: z.ZodNumber;
            used_memory: z.ZodNumber;
            total_disk: z.ZodNumber;
            used_disk: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            total_memory: number;
            used_memory: number;
            total_disk: number;
            used_disk: number;
        }, {
            total_memory: number;
            used_memory: number;
            total_disk: number;
            used_disk: number;
        }>;
    }, "strip", z.ZodTypeAny, {
        users: {
            total: number;
            active_today: number;
            new_this_week: number;
        };
        servers: {
            total: number;
            running: number;
            stopped: number;
            installing: number;
        };
        resources: {
            total_memory: number;
            used_memory: number;
            total_disk: number;
            used_disk: number;
        };
    }, {
        users: {
            total: number;
            active_today: number;
            new_this_week: number;
        };
        servers: {
            total: number;
            running: number;
            stopped: number;
            installing: number;
        };
        resources: {
            total_memory: number;
            used_memory: number;
            total_disk: number;
            used_disk: number;
        };
    }>;
    alerts: z.ZodArray<z.ZodObject<{
        level: z.ZodEnum<["info", "warning", "error", "critical"]>;
        message: z.ZodString;
        timestamp: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        message: string;
        level: "warning" | "critical" | "info" | "error";
        timestamp: string;
    }, {
        message: string;
        level: "warning" | "critical" | "info" | "error";
        timestamp: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    system: {
        status: "healthy" | "warning" | "critical";
        uptime: number;
        version: string;
    };
    statistics: {
        users: {
            total: number;
            active_today: number;
            new_this_week: number;
        };
        servers: {
            total: number;
            running: number;
            stopped: number;
            installing: number;
        };
        resources: {
            total_memory: number;
            used_memory: number;
            total_disk: number;
            used_disk: number;
        };
    };
    alerts: {
        message: string;
        level: "warning" | "critical" | "info" | "error";
        timestamp: string;
    }[];
}, {
    system: {
        status: "healthy" | "warning" | "critical";
        uptime: number;
        version: string;
    };
    statistics: {
        users: {
            total: number;
            active_today: number;
            new_this_week: number;
        };
        servers: {
            total: number;
            running: number;
            stopped: number;
            installing: number;
        };
        resources: {
            total_memory: number;
            used_memory: number;
            total_disk: number;
            used_disk: number;
        };
    };
    alerts: {
        message: string;
        level: "warning" | "critical" | "info" | "error";
        timestamp: string;
    }[];
}>;
export type DashboardStats = z.infer<typeof DashboardStatsSchema>;
/**
 * Get admin dashboard overview with system statistics
 * GET /api/admin/dashboard
 */
export declare function getDashboardOverview(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Get real-time system metrics
 * GET /api/admin/dashboard/metrics
 */
export declare function getSystemMetrics(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Get system health status
 * GET /api/admin/dashboard/health
 */
export declare function getSystemHealth(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export {};
//# sourceMappingURL=dashboard.d.ts.map