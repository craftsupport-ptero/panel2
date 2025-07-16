"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserAnalytics = getUserAnalytics;
exports.getServerAnalytics = getServerAnalytics;
exports.getResourceAnalytics = getResourceAnalytics;
exports.getPerformanceMetrics = getPerformanceMetrics;
exports.exportAnalytics = exportAnalytics;
const zod_1 = require("zod");
// Analytics query schema
const AnalyticsQuerySchema = zod_1.z.object({
    timeframe: zod_1.z.enum(['1h', '6h', '24h', '7d', '30d', '90d']).default('24h'),
    granularity: zod_1.z.enum(['minute', 'hour', 'day']).default('hour'),
    metrics: zod_1.z.array(zod_1.z.string()).optional()
});
// Export analytics schema
const ExportAnalyticsSchema = zod_1.z.object({
    format: zod_1.z.enum(['csv', 'json', 'pdf']).default('csv'),
    timeframe: zod_1.z.string(),
    metrics: zod_1.z.array(zod_1.z.string()),
    filters: zod_1.z.object({
        user_id: zod_1.z.number().optional(),
        node_id: zod_1.z.number().optional(),
        server_id: zod_1.z.number().optional()
    }).optional()
});
/**
 * Get user analytics and trends
 * GET /api/admin/analytics/users
 */
async function getUserAnalytics(req, res) {
    try {
        if (!req.user?.hasPermission('admin.analytics.view')) {
            return res.status(403).json({
                error: 'Insufficient permissions'
            });
        }
        const { timeframe, granularity } = AnalyticsQuerySchema.parse(req.query);
        // TODO: Implement actual user analytics
        const analytics = {
            timeframe,
            granularity,
            summary: {
                total_users: 1250,
                active_users: 789,
                new_registrations: 23,
                user_growth_rate: 12.5 // percentage
            },
            time_series: [
                {
                    timestamp: '2024-01-15T00:00:00Z',
                    active_users: 145,
                    new_registrations: 3,
                    logins: 89
                },
                {
                    timestamp: '2024-01-15T01:00:00Z',
                    active_users: 178,
                    new_registrations: 2,
                    logins: 112
                }
            ],
            demographics: {
                by_region: [
                    { region: 'North America', users: 456, percentage: 36.5 },
                    { region: 'Europe', users: 387, percentage: 31.0 },
                    { region: 'Asia', users: 278, percentage: 22.2 },
                    { region: 'Other', users: 129, percentage: 10.3 }
                ],
                by_plan: [
                    { plan: 'Free', users: 892, percentage: 71.4 },
                    { plan: 'Basic', users: 245, percentage: 19.6 },
                    { plan: 'Premium', users: 113, percentage: 9.0 }
                ]
            },
            activity_patterns: {
                peak_hours: [18, 19, 20, 21], // UTC hours
                most_active_day: 'Saturday',
                avg_session_duration: 1847 // seconds
            }
        };
        res.json(analytics);
    }
    catch (error) {
        console.error('User analytics error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to retrieve user analytics'
        });
    }
}
/**
 * Get server usage analytics
 * GET /api/admin/analytics/servers
 */
async function getServerAnalytics(req, res) {
    try {
        if (!req.user?.hasPermission('admin.analytics.view')) {
            return res.status(403).json({
                error: 'Insufficient permissions'
            });
        }
        const { timeframe, granularity } = AnalyticsQuerySchema.parse(req.query);
        // TODO: Implement actual server analytics
        const analytics = {
            timeframe,
            granularity,
            summary: {
                total_servers: 456,
                avg_uptime: 99.2,
                avg_cpu_usage: 68.7,
                avg_memory_usage: 75.8,
                total_restarts: 23
            },
            time_series: [
                {
                    timestamp: '2024-01-15T00:00:00Z',
                    running_servers: 312,
                    cpu_usage: 65.4,
                    memory_usage: 73.2,
                    disk_usage: 64.8
                },
                {
                    timestamp: '2024-01-15T01:00:00Z',
                    running_servers: 318,
                    cpu_usage: 68.1,
                    memory_usage: 75.9,
                    disk_usage: 65.1
                }
            ],
            by_game_type: [
                {
                    game: 'Minecraft',
                    count: 280,
                    avg_cpu: 45.2,
                    avg_memory: 2048,
                    avg_players: 12.5
                },
                {
                    game: 'CS:GO',
                    count: 95,
                    avg_cpu: 78.9,
                    avg_memory: 1024,
                    avg_players: 18.3
                },
                {
                    game: 'Rust',
                    count: 81,
                    avg_cpu: 89.1,
                    avg_memory: 4096,
                    avg_players: 35.7
                }
            ],
            performance_metrics: {
                top_performing: [
                    { server_id: 101, name: 'minecraft-prod-01', uptime: 100, avg_cpu: 35.2 },
                    { server_id: 203, name: 'csgo-competitive-01', uptime: 99.8, avg_cpu: 42.1 }
                ],
                problematic: [
                    { server_id: 405, name: 'rust-server-05', issues: ['high_cpu', 'memory_leak'], severity: 'high' }
                ]
            }
        };
        res.json(analytics);
    }
    catch (error) {
        console.error('Server analytics error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to retrieve server analytics'
        });
    }
}
/**
 * Get resource utilization reports
 * GET /api/admin/analytics/resources
 */
async function getResourceAnalytics(req, res) {
    try {
        if (!req.user?.hasPermission('admin.analytics.view')) {
            return res.status(403).json({
                error: 'Insufficient permissions'
            });
        }
        const { timeframe, granularity } = AnalyticsQuerySchema.parse(req.query);
        // TODO: Implement actual resource analytics
        const analytics = {
            timeframe,
            granularity,
            summary: {
                total_memory: 512000,
                used_memory: 387500,
                total_disk: 10000000,
                used_disk: 6500000,
                efficiency_score: 78.5
            },
            utilization_trends: [
                {
                    timestamp: '2024-01-15T00:00:00Z',
                    memory_usage: 73.2,
                    disk_usage: 64.8,
                    cpu_usage: 65.4,
                    network_io: 125.7
                },
                {
                    timestamp: '2024-01-15T01:00:00Z',
                    memory_usage: 75.9,
                    disk_usage: 65.1,
                    cpu_usage: 68.1,
                    network_io: 142.3
                }
            ],
            by_node: [
                {
                    node_id: 1,
                    name: 'US-East-1',
                    memory_efficiency: 85.2,
                    disk_efficiency: 72.8,
                    cpu_efficiency: 78.9,
                    cost_per_gb: 0.125
                },
                {
                    node_id: 2,
                    name: 'US-West-1',
                    memory_efficiency: 81.7,
                    disk_efficiency: 76.3,
                    cpu_efficiency: 82.1,
                    cost_per_gb: 0.118
                }
            ],
            waste_analysis: {
                underutilized_memory: 45800, // MB
                underutilized_disk: 890000, // MB
                potential_savings: 285.50, // USD per month
                optimization_opportunities: [
                    'Rightsize 15 oversized Minecraft servers',
                    'Consolidate 8 low-usage development servers',
                    'Implement auto-scaling for 12 variable-load servers'
                ]
            }
        };
        res.json(analytics);
    }
    catch (error) {
        console.error('Resource analytics error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to retrieve resource analytics'
        });
    }
}
/**
 * Get system performance metrics
 * GET /api/admin/analytics/performance
 */
async function getPerformanceMetrics(req, res) {
    try {
        if (!req.user?.hasPermission('admin.analytics.view')) {
            return res.status(403).json({
                error: 'Insufficient permissions'
            });
        }
        const { timeframe, granularity } = AnalyticsQuerySchema.parse(req.query);
        // TODO: Implement actual performance analytics
        const metrics = {
            timeframe,
            granularity,
            summary: {
                overall_score: 87.3,
                availability: 99.8,
                response_time: 125, // ms
                error_rate: 0.02 // percentage
            },
            response_times: [
                {
                    timestamp: '2024-01-15T00:00:00Z',
                    api_response: 118,
                    database_query: 15,
                    file_operation: 45,
                    network_latency: 23
                },
                {
                    timestamp: '2024-01-15T01:00:00Z',
                    api_response: 132,
                    database_query: 18,
                    file_operation: 52,
                    network_latency: 28
                }
            ],
            error_analysis: {
                total_errors: 45,
                by_category: [
                    { category: 'Network timeout', count: 18, percentage: 40.0 },
                    { category: 'Database connection', count: 12, percentage: 26.7 },
                    { category: 'File system', count: 8, percentage: 17.8 },
                    { category: 'Other', count: 7, percentage: 15.5 }
                ],
                trends: {
                    this_week: -15.2, // percentage change
                    this_month: -8.7
                }
            },
            bottlenecks: [
                {
                    component: 'Database queries',
                    impact: 'medium',
                    avg_delay: 45,
                    suggestions: ['Add query caching', 'Optimize slow queries']
                },
                {
                    component: 'File I/O operations',
                    impact: 'low',
                    avg_delay: 23,
                    suggestions: ['Implement async file operations']
                }
            ]
        };
        res.json(metrics);
    }
    catch (error) {
        console.error('Performance metrics error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to retrieve performance metrics'
        });
    }
}
/**
 * Export analytics data
 * POST /api/admin/analytics/export
 */
async function exportAnalytics(req, res) {
    try {
        if (!req.user?.hasPermission('admin.analytics.export')) {
            return res.status(403).json({
                error: 'Insufficient permissions'
            });
        }
        const { format, timeframe, metrics, filters } = ExportAnalyticsSchema.parse(req.body);
        // TODO: Implement actual data export
        const exportJob = {
            export_id: `analytics-export-${Date.now()}`,
            format,
            timeframe,
            metrics,
            filters,
            status: 'generating',
            estimated_completion: new Date(Date.now() + 120000).toISOString(), // 2 minutes
            download_url: null,
            file_size: null,
            expires_at: new Date(Date.now() + 86400000).toISOString() // 24 hours
        };
        res.json(exportJob);
    }
    catch (error) {
        console.error('Analytics export error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to export analytics data'
        });
    }
}
//# sourceMappingURL=analytics.js.map