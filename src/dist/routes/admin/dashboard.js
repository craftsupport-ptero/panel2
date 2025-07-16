"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardOverview = getDashboardOverview;
exports.getSystemMetrics = getSystemMetrics;
exports.getSystemHealth = getSystemHealth;
const zod_1 = require("zod");
// Dashboard statistics schema
const DashboardStatsSchema = zod_1.z.object({
    system: zod_1.z.object({
        uptime: zod_1.z.number(),
        version: zod_1.z.string(),
        status: zod_1.z.enum(['healthy', 'warning', 'critical'])
    }),
    statistics: zod_1.z.object({
        users: zod_1.z.object({
            total: zod_1.z.number(),
            active_today: zod_1.z.number(),
            new_this_week: zod_1.z.number()
        }),
        servers: zod_1.z.object({
            total: zod_1.z.number(),
            running: zod_1.z.number(),
            stopped: zod_1.z.number(),
            installing: zod_1.z.number()
        }),
        resources: zod_1.z.object({
            total_memory: zod_1.z.number(),
            used_memory: zod_1.z.number(),
            total_disk: zod_1.z.number(),
            used_disk: zod_1.z.number()
        })
    }),
    alerts: zod_1.z.array(zod_1.z.object({
        level: zod_1.z.enum(['info', 'warning', 'error', 'critical']),
        message: zod_1.z.string(),
        timestamp: zod_1.z.string()
    }))
});
/**
 * Get admin dashboard overview with system statistics
 * GET /api/admin/dashboard
 */
async function getDashboardOverview(req, res) {
    try {
        // Check admin permissions
        if (!req.user?.hasPermission('admin.dashboard.view')) {
            return res.status(403).json({
                error: 'Insufficient permissions',
                message: 'You do not have permission to view the admin dashboard'
            });
        }
        // Get system uptime
        const uptime = process.uptime();
        // TODO: Integrate with actual database/services
        // This is a mock implementation for now
        const dashboardData = {
            system: {
                uptime: Math.floor(uptime),
                version: '2.0.0-serverless',
                status: 'healthy'
            },
            statistics: {
                users: {
                    total: 1250,
                    active_today: 89,
                    new_this_week: 23
                },
                servers: {
                    total: 456,
                    running: 312,
                    stopped: 98,
                    installing: 46
                },
                resources: {
                    total_memory: 512000,
                    used_memory: 287500,
                    total_disk: 10000000,
                    used_disk: 4500000
                }
            },
            alerts: [
                {
                    level: 'warning',
                    message: 'Node US-East-1 approaching memory limit',
                    timestamp: new Date().toISOString()
                }
            ]
        };
        // Validate response data
        const validatedData = DashboardStatsSchema.parse(dashboardData);
        res.json(validatedData);
    }
    catch (error) {
        console.error('Dashboard overview error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to retrieve dashboard data'
        });
    }
}
/**
 * Get real-time system metrics
 * GET /api/admin/dashboard/metrics
 */
async function getSystemMetrics(req, res) {
    try {
        if (!req.user?.hasPermission('admin.dashboard.view')) {
            return res.status(403).json({
                error: 'Insufficient permissions'
            });
        }
        // Mock real-time metrics
        const metrics = {
            cpu_usage: Math.random() * 100,
            memory_usage: Math.random() * 100,
            disk_usage: Math.random() * 100,
            network_in: Math.random() * 1000,
            network_out: Math.random() * 1000,
            active_connections: Math.floor(Math.random() * 500),
            timestamp: new Date().toISOString()
        };
        res.json(metrics);
    }
    catch (error) {
        console.error('System metrics error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to retrieve system metrics'
        });
    }
}
/**
 * Get system health status
 * GET /api/admin/dashboard/health
 */
async function getSystemHealth(req, res) {
    try {
        if (!req.user?.hasPermission('admin.system.view')) {
            return res.status(403).json({
                error: 'Insufficient permissions'
            });
        }
        // Mock health checks
        const health = {
            database: { status: 'healthy', response_time: 15 },
            cache: { status: 'healthy', response_time: 2 },
            storage: { status: 'healthy', response_time: 8 },
            nodes: {
                total: 5,
                healthy: 4,
                warning: 1,
                critical: 0
            },
            overall_status: 'healthy',
            last_check: new Date().toISOString()
        };
        res.json(health);
    }
    catch (error) {
        console.error('System health error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to retrieve system health'
        });
    }
}
//# sourceMappingURL=dashboard.js.map